from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from plaid.api import plaid_api
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.country_code import CountryCode
from plaid.model.products import Products
from plaid import ApiClient, Configuration
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest

# Configuración de Plaid
PLAID_CLIENT_ID = os.getenv("PLAID_CLIENT_ID")
PLAID_SECRET = os.getenv("PLAID_SECRET")
PLAID_ENV = os.getenv("PLAID_ENV", "sandbox")  # Usa 'sandbox' para pruebas

# URLs para los diferentes entornos
PLAID_HOST = {
    "sandbox": "https://sandbox.plaid.com",
    "development": "https://development.plaid.com",
    "production": "https://production.plaid.com"
}.get(PLAID_ENV, "https://sandbox.plaid.com")

# Inicializar cliente Plaid
configuration = Configuration(host=PLAID_HOST,
                              api_key={
                                  "clientId": PLAID_CLIENT_ID,
                                  "secret": PLAID_SECRET,
                              })
api_client = ApiClient(configuration)
client = plaid_api.PlaidApi(api_client)

# Configurar Flask
app = Flask(__name__)
CORS(app)


@app.route('/create_link_token', methods=['GET'])
def create_link_token_endpoint():
    """Genera un link_token para inicializar el widget de Plaid."""
    try:
        request_data = LinkTokenCreateRequest(
            user=LinkTokenCreateRequestUser(client_user_id="unique_user_id"),
            client_name="Andy AI",
            products=[Products("transactions")],
            country_codes=[CountryCode("US")],
            language="en")
        response = client.link_token_create(request_data)
        return jsonify({"link_token": response.link_token}), 200
    except Exception as e:
        print(f"Error al generar el link_token: {e}")
        return jsonify({"error": "No se pudo generar el link_token"}), 500


@app.route('/exchange_public_token', methods=['POST'])
def exchange_public_token_endpoint():
    """Intercambiar public_token por access_token."""
    try:
        data = request.get_json()
        public_token = data.get("public_token")

        if not public_token:
            return jsonify({"error": "public_token es requerido"}), 400

        exchange_request = ItemPublicTokenExchangeRequest(
            public_token=public_token)
        response = client.item_public_token_exchange(exchange_request)
        return jsonify({
            "access_token": response.access_token,
            "item_id": response.item_id
        }), 200
    except Exception as e:
        print(f"Error al intercambiar el token: {e}")
        return jsonify({"error": "Error al intercambiar el token"}), 500


@app.route('/test', methods=['GET'])
def test_endpoint():
    return jsonify({"message": "Test endpoint is working!"}), 200


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
