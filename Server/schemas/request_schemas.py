"""Input validation for predict / simulate payloads."""


class ValidationError(ValueError):
    pass


def _validate_feature_map(features: dict, ms, allow_partial: bool) -> dict:
    if not isinstance(features, dict):
        raise ValidationError("expected a JSON object of feature -> value")
    unknown = [k for k in features if k not in ms.feature_cols]
    if unknown:
        raise ValidationError(f"unknown feature(s): {', '.join(sorted(unknown))}")

    cleaned = {}
    for col, val in features.items():
        if col in ms.mappings:
            categories = ms.mappings[col]["categories"]
            if str(val) not in categories:
                raise ValidationError(
                    f"invalid value {val!r} for '{col}'; expected one of {categories}"
                )
            cleaned[col] = str(val)
        else:
            try:
                num = float(val)
            except (TypeError, ValueError):
                raise ValidationError(f"'{col}' must be a number")
            if num != num or num in (float("inf"), float("-inf")):
                raise ValidationError(f"'{col}' must be a finite number")
            cleaned[col] = int(num) if col == "tenure_months" else num
    if not allow_partial and not cleaned:
        raise ValidationError("no features provided")
    return cleaned


def validate_predict(payload: dict, ms) -> dict:
    if not isinstance(payload, dict) or "features" not in payload:
        raise ValidationError("body must contain a 'features' object")
    base = dict(ms.defaults)
    base.update(_validate_feature_map(payload["features"], ms, allow_partial=False))
    return base


def validate_simulate(payload: dict, ms) -> dict:
    if not isinstance(payload, dict):
        raise ValidationError("body must be a JSON object")
    base_account_id = payload.get("base_account_id")
    if not base_account_id or not isinstance(base_account_id, str):
        raise ValidationError("'base_account_id' is required")
    overrides = _validate_feature_map(payload.get("overrides", {}), ms, allow_partial=True)
    return {"base_account_id": base_account_id, "overrides": overrides}
