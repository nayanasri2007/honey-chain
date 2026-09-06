def predict_honey_productivity(
    weight_trend: float,
    average_temperature: float,
    average_humidity: float,
    average_bee_activity: float,
):
    """
    Transparent prototype productivity prediction.

    This is a rule-based estimation for the SIH prototype.
    It should not be treated as a guaranteed honey yield.
    """

    score = 50.0
    factors = []

    # Weight trend
    if weight_trend >= 1.0:
        score += 25
        factors.append("Strong positive hive weight trend")
    elif weight_trend >= 0.3:
        score += 15
        factors.append("Positive hive weight trend")
    elif weight_trend > -0.3:
        score += 5
        factors.append("Hive weight is relatively stable")
    else:
        score -= 20
        factors.append("Hive weight is decreasing")

    # Bee activity
    if average_bee_activity >= 80:
        score += 20
        factors.append("High bee activity")
    elif average_bee_activity >= 60:
        score += 10
        factors.append("Healthy bee activity")
    elif average_bee_activity >= 40:
        score -= 5
        factors.append("Reduced bee activity")
    else:
        score -= 20
        factors.append("Very low bee activity")

    # Temperature
    if 32 <= average_temperature <= 36:
        score += 10
        factors.append("Temperature is within preferred range")
    elif 30 <= average_temperature <= 38:
        score -= 5
        factors.append("Temperature is outside preferred range")
    else:
        score -= 15
        factors.append("Temperature is in a critical range")

    # Humidity
    if 55 <= average_humidity <= 75:
        score += 10
        factors.append("Humidity is within preferred range")
    elif 50 <= average_humidity <= 80:
        score -= 5
        factors.append("Humidity is outside preferred range")
    else:
        score -= 15
        factors.append("Humidity is in a critical range")

    score = max(0, min(100, score))

    if score >= 80:
        productivity_level = "High"
    elif score >= 60:
        productivity_level = "Medium"
    elif score >= 40:
        productivity_level = "Low"
    else:
        productivity_level = "Very Low"

    # Prototype yield estimation.
    # This represents expected production under current conditions,
    # not a guaranteed harvest quantity.
    predicted_honey_kg = round(5 + (score / 100) * 20, 2)

    confidence_score = round(
        min(
            95,
            60
            + min(20, abs(weight_trend) * 10)
            + min(15, average_bee_activity / 10)
        ),
        2,
    )

    return {
        "predicted_honey_kg": predicted_honey_kg,
        "productivity_level": productivity_level,
        "confidence_score": confidence_score,
        "influencing_factors": factors,
    }