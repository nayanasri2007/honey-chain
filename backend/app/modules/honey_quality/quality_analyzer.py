def analyze_honey_quality(
    average_temperature: float,
    moisture_percent: float,
    exposure_hours: float,
):
    """
    Explainable rule-based Honey Quality Risk Analyzer.

    This is a prototype risk assessment.
    It does not prove honey purity or adulteration.
    Laboratory testing is required for chemical quality verification.
    """

    score = 100.0
    factors = []

    # -----------------------------
    # Moisture assessment
    # -----------------------------
    if moisture_percent <= 18:
        factors.append("Moisture level is within a preferred range")
    elif moisture_percent <= 20:
        score -= 10
        factors.append("Moisture level is slightly elevated")
    elif moisture_percent <= 22:
        score -= 25
        factors.append("High moisture may increase fermentation risk")
    else:
        score -= 40
        factors.append("Very high moisture indicates significant fermentation risk")

    # -----------------------------
    # Temperature assessment
    # -----------------------------
    if average_temperature < 20:
        factors.append("Storage temperature is cool")
    elif average_temperature <= 25:
        score -= 3
        factors.append("Temperature is generally suitable")
    elif average_temperature <= 35:
        score -= 10
        factors.append("Warm exposure may accelerate quality degradation")
    elif average_temperature <= 45:
        score -= 20
        factors.append("High temperature exposure increases quality risk")
    elif average_temperature <= 60:
        score -= 35
        factors.append("Very high temperature may significantly affect honey quality")
    else:
        score -= 50
        factors.append("Extreme heating presents a significant quality concern")

    # -----------------------------
    # Exposure duration
    # -----------------------------
    if exposure_hours <= 2:
        factors.append("Short temperature exposure duration")
    elif exposure_hours <= 12:
        score -= 5
        factors.append("Moderate temperature exposure duration")
    elif exposure_hours <= 24:
        score -= 10
        factors.append("Extended temperature exposure duration")
    else:
        score -= 20
        factors.append("Prolonged temperature exposure increases quality risk")

    # -----------------------------
    # Combined risk
    # -----------------------------
    if average_temperature > 35 and exposure_hours > 12:
        score -= 10
        factors.append(
            "High temperature combined with prolonged exposure increases degradation risk"
        )

    if moisture_percent > 20 and average_temperature > 25:
        score -= 10
        factors.append(
            "Elevated moisture combined with warm conditions increases spoilage risk"
        )

    # Keep score within 0–100
    score = max(0, min(100, score))

    # -----------------------------
    # Quality classification
    # -----------------------------
    if score >= 80:
        quality_level = "Excellent"
        risk_level = "Low"
    elif score >= 65:
        quality_level = "Good"
        risk_level = "Low"
    elif score >= 50:
        quality_level = "Acceptable"
        risk_level = "Medium"
    elif score >= 35:
        quality_level = "At Risk"
        risk_level = "High"
    else:
        quality_level = "Poor"
        risk_level = "Critical"

    # -----------------------------
    # Recommendation
    # -----------------------------
    if risk_level == "Low":
        recommendation = (
            "Maintain recommended storage conditions and continue monitoring."
        )
    elif risk_level == "Medium":
        recommendation = (
            "Monitor moisture and storage temperature closely. "
            "Consider quality verification if risk persists."
        )
    elif risk_level == "High":
        recommendation = (
            "Review storage and processing conditions. "
            "Laboratory quality testing is recommended."
        )
    else:
        recommendation = (
            "Immediate quality investigation is recommended. "
            "Perform laboratory testing before distribution."
        )

    return {
        "quality_score": round(score, 2),
        "quality_level": quality_level,
        "risk_level": risk_level,
        "risk_factors": factors,
        "recommendation": recommendation,
    }