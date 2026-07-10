import requests
import math
from core.config import GEOAPIFY_API_KEY


def calculate_distance_km(lat1, lon1, lat2, lon2):
    """
    Haversine formula vaparun don points chya madhla distance calculate karto (km madhe).
    """
    R = 6371  # Earth cha radius km madhe
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)


def find_nearby_hospitals(latitude: float, longitude: float, radius_meters: int = 10000):
    """
    Geoapify Places API vaparun javalchi hospitals shodhto.
    """
    url = "https://api.geoapify.com/v2/places"

    params = {
        "categories": "healthcare.hospital",
        "filter": f"circle:{longitude},{latitude},{radius_meters}",
        "bias": f"proximity:{longitude},{latitude}",
        "limit": 15,
        "apiKey": GEOAPIFY_API_KEY,
    }

    try:
        response = requests.get(url, params=params, timeout=15)
        if response.status_code != 200:
            return []

        data = response.json()
        hospitals = []

        for item in data.get("features", []):
            p = item.get("properties", {})
            geometry = item.get("geometry", {})
            coords = geometry.get("coordinates", [None, None])
            h_lon, h_lat = coords[0], coords[1]

            if not h_lat or not h_lon:
                continue

            distance = calculate_distance_km(latitude, longitude, h_lat, h_lon)

            hospitals.append({
                "name": p.get("name", "Hospital"),
                "address": p.get("formatted", "Address not available"),
                "phone": p.get("contact", {}).get("phone"),
                "rating": p.get("rating"),  # Geoapify kadhi kadhi rating deते, nahitar None
                "is_open": p.get("opening_hours") is not None,  # simplistic check
                "distance_km": distance,
                "latitude": h_lat,
                "longitude": h_lon,
            })

        # Distance nusar sort kara (javalचं pahile)
        hospitals.sort(key=lambda h: h["distance_km"])
        return hospitals

    except requests.exceptions.RequestException:
        return []