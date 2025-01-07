import React, { useState } from "react";
import { usePlaidLink } from "react-plaid-link";

const Onboarding = () => {
    const [linkToken, setLinkToken] = useState<string | null>(null);

    // Solicitar el link_token desde el backend
    const fetchLinkToken = async () => {
        try {
            const response = await fetch(
                "http://127.0.0.1:5000/create_link_token",
                {
                    method: "GET",
                },
            );
            const data = await response.json();
            setLinkToken(data.link_token);
        } catch (error) {
            console.error("Error al obtener el link_token:", error);
        }
    };

    React.useEffect(() => {
        fetchLinkToken();
    }, []);

    if (!linkToken) {
        return <p>Cargando...</p>;
    }

    return <PlaidLinkWidget linkToken={linkToken} />;
};

const PlaidLinkWidget = ({ linkToken }: { linkToken: string }) => {
    const { open, ready } = usePlaidLink({
        token: linkToken,
        onSuccess: (publicToken, metadata) => {
            console.log("Public Token:", publicToken);
            alert(`¡Cuenta conectada! Public Token: ${publicToken}`);
            // Aquí puedes enviar el publicToken al backend si quieres.
        },
        onExit: (error, metadata) => {
            console.error(
                "El usuario salió sin conectar la cuenta:",
                error,
                metadata,
            );
        },
    });

    return (
        <button onClick={() => open()} disabled={!ready}>
            Conectar Cuenta Bancaria
        </button>
    );
};

export default Onboarding;
