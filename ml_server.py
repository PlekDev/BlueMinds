# ml_server.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import uvicorn
from collections import Counter
import json

app = FastAPI(title="BlueMinds ML", description="Roadmap IA para niños")

# === MODELOS ===
class RespuestaNino(BaseModel):
    tipo_aprendizaje: str  # "Visual", "Auditivo", "Kinestésico", "Lecto Escritor"
    nivel: int             # 1, 2, 3
    es_correcta: bool
    tiempo_segundos: int = 0

class RespuestaPadre(BaseModel):
    pregunta_id: int
    respuesta: str  # "Totalmente de acuerdo", etc.

class InputQuiz(BaseModel):
    respuestas_nino: List[RespuestaNino] = []
    respuestas_padre: List[RespuestaPadre] = []

# === LÓGICA ML ===
def analizar_nino(respuestas: List[RespuestaNino]) -> Dict:
    if not respuestas:
        return {"estilo": "Visual", "nivel_autismo": "Bajo", "score": 85}

    # 1. Estilo principal
    estilos = [r.tipo_aprendizaje for r in respuestas]
    estilo_principal = Counter(estilos).most_common(1)[0][0]

    # 2. Precisión por nivel
    correctas = sum(1 for r in respuestas if r.es_correcta)
    total = len(respuestas)
    precision = (correctas / total) * 100

    # 3. Nivel autismo (simulado por precisión + nivel)
    nivel_map = {1: 0, 2: 1, 3: 2}
    dificultad_promedio = sum(nivel_map[r.nivel] for r in respuestas) / total
    if precision >= 80 and dificultad_promedio < 1:
        nivel_autismo = "Bajo"
    elif precision >= 50:
        nivel_autismo = "Moderado"
    else:
        nivel_autismo = "Alto"

    return {
        "estilo": estilo_principal,
        "nivel_autismo": nivel_autismo,
        "precision": round(precision, 1)
    }

def analizar_padre(respuestas: List[RespuestaPadre]) -> str:
    # Simulación AQ-Child
    puntuacion = 0
    for r in respuestas:
        if r.respuesta in ["Totalmente de acuerdo", "Un poco de acuerdo"]:
            puntuacion += 2 if r.pregunta_id in [2,4,16,39] else 1
        elif r.respuesta == "Un poco en desacuerdo":
            puntuacion += 1

    if puntuacion <= 30:
        return "Nivel 1"
    elif puntuacion <= 60:
        return "Nivel 2"
    else:
        return "Nivel 3"

def generar_roadmap(estilo: str, nivel_autismo: str, precision: float) -> Dict:
    actividades = {
        "Visual": [
            {"nombre": "Juego de imágenes", "nivel": 1},
            {"nombre": "Secuencias visuales", "nivel": 2},
            {"nombre": "Rompecabezas", "nivel": 3}
        ],
        "Auditivo": [
            {"nombre": "Repite sonidos", "nivel": 1},
            {"nombre": "Canciones simples", "nivel": 2},
            {"nombre": "Historias con ritmo", "nivel": 3}
        ],
        "Kinestésico": [
            {"nombre": "Mover brazos", "nivel": 1},
            {"nombre": "Imitar emociones", "nivel": 2},
            {"nombre": "Juegos de roles", "nivel": 3}
        ],
        "Lecto Escritor": [
            {"nombre": "Reordenar palabras", "nivel": 1},
            {"nombre": "Completar oraciones", "nivel": 2},
            {"nombre": "Leer cuentos", "nivel": 3}
        ]
    }

    return {
        "estilo": estilo,
        "nivel_autismo": nivel_autismo,
        "precision": precision,
        "actividades": actividades.get(estilo, actividades["Visual"])
    }

# === ENDPOINT ===
@app.post("/api/generar-roadmap")
async def generar_roadmap_endpoint(data: InputQuiz):
    try:
        # Análisis niño
        nino = analizar_nino(data.respuestas_nino)
        
        # Análisis padre (opcional)
        nivel_padre = analizar_padre(data.respuestas_padre) if data.respuestas_padre else None

        # Roadmap final
        roadmap = generar_roadmap(
            estilo=nino["estilo"],
            nivel_autismo=nivel_padre or nino["nivel_autismo"],
            precision=nino["precision"]
        )

        return {
            "success": True,
            "roadmap": roadmap,
            "debug": {
                "estilo_detectado": nino["estilo"],
                "nivel_sugerido": nivel_padre or nino["nivel_autismo"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# === CORRER ===
if __name__ == "__main__":
    print("ML Server corriendo en http://localhost:8000")
    print("Endpoint: POST /api/generar-roadmap")
    uvicorn.run(app, host="127.0.0.1", port=8000)