from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import logging
import httpx
import os

from core.database import get_database
from utils.response import success_response
from utils.auth import get_current_user_id

logger = logging.getLogger(__name__)
router = APIRouter()

RXNORM_BASE_URL = "https://rxnav.nlm.nih.gov/REST"


class InteractionCheckRequest(BaseModel):
    medication_names: List[str]


@router.get("/search", response_model=dict)
async def search_medication(
    query: str,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Search for medications using RxNorm API"""
    try:
        if not query or len(query) < 2:
            return success_response(data=[], message="Query too short")

        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                f"{RXNORM_BASE_URL}/drugs.json",
                params={"name": query}
            )

            if response.status_code != 200:
                return success_response(data=[], message="RxNorm API unavailable")

            data = response.json()
            results = []

            drug_group = data.get("drugGroup", {})
            concept_groups = drug_group.get("conceptGroup", [])

            for group in concept_groups:
                concepts = group.get("conceptProperties", [])
                for concept in concepts[:10]:
                    results.append({
                        "rxcui": concept.get("rxcui"),
                        "name": concept.get("name"),
                        "synonym": concept.get("synonym", ""),
                        "tty": concept.get("tty", "")
                    })

            return success_response(
                data=results[:15],
                message=f"Found {len(results)} results"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"RxNorm search error: {e}")
        return success_response(data=[], message="Search failed")


@router.get("/info/{rxcui}", response_model=dict)
async def get_medication_info(
    rxcui: str,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Get detailed info for a medication by RxCUI"""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            props_resp = await client.get(
                f"{RXNORM_BASE_URL}/rxcui/{rxcui}/allProperties.json",
                params={"prop": "names+attributes"}
            )

            info = {"rxcui": rxcui}

            if props_resp.status_code == 200:
                props_data = props_resp.json()
                prop_concepts = props_data.get("propConceptGroup", {}).get("propConcept", [])
                for prop in prop_concepts:
                    name = prop.get("propName", "")
                    value = prop.get("propValue", "")
                    if name in ["RxNorm Name", "AVAILABLE_STRENGTH", "DOSE_FORM", "ROUTE"]:
                        info[name.lower().replace(" ", "_")] = value

            return success_response(data=info, message="Medication info retrieved")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"RxNorm info error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/check-interactions", response_model=dict)
async def check_interactions(
    request: InteractionCheckRequest,
    authorization: str = Header(None),
    db=Depends(get_database)
):
    """Check drug interactions using AI analysis (RxNorm interaction API was discontinued)"""
    try:
        if len(request.medication_names) < 2:
            return success_response(
                data={"interactions": [], "summary": "Need at least 2 medications to check interactions"},
                message="Add more medications"
            )

        from emergentintegrations.llm import chat, ChatMessage

        med_list = ", ".join(request.medication_names)
        messages = [
            ChatMessage(
                role="system",
                content="You are a pharmacology expert. Provide concise, factual drug interaction information. Always note that this is informational only and users should consult their pharmacist or doctor. Format response as: 1) Known interactions between these drugs 2) Severity level (Minor/Moderate/Major) 3) What to watch for. Keep it brief and clear."
            ),
            ChatMessage(
                role="user",
                content=f"Check for potential drug interactions between these medications: {med_list}"
            )
        ]

        emergent_key = os.environ.get("EMERGENT_LLM_KEY")
        response = await chat(
            api_key=emergent_key,
            model="gpt-5.2",
            messages=messages
        )

        return success_response(
            data={
                "medications": request.medication_names,
                "analysis": response,
                "disclaimer": "This is AI-generated information for reference only. Always consult your pharmacist or healthcare provider for medical advice."
            },
            message="Interaction check complete"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Interaction check error: {e}")
        return success_response(
            data={
                "medications": request.medication_names,
                "analysis": "Unable to check interactions at this time. Please consult your pharmacist.",
                "disclaimer": "Always consult your healthcare provider."
            },
            message="Interaction check unavailable"
        )
