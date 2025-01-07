import React from "react";
import { usePlaidLink } from "react-plaid-link";

interface PlaidLinkWidgetProps {
    linkToken: string; // Token generado por el backend
    onSuccess: (publicToken: string, metadata: any) => void; // Función para manejar éxito
    onExit?: (error: any, metadata: any) => void; // Función para manejar salida sin conectar
}

const PlaidLinkWidget: React.FC<PlaidLinkWidgetProps> = ({
    linkToken,
    onSuccess,
    onExit,
}) => {
    const { open, ready } = usePlaidLink({
        token: linkToken,
        onSuccess: (publicToken, metadata) => {
            console.log("Conexión exitosa:", publicToken, metadata);
            onSuccess(publicToken, metadata);
        },
        onExit: (error, metadata) => {
            console.error(
                "El usuario salió sin conectar su cuenta:",
                error,
                metadata,
            );
            if (onExit) onExit(error, metadata);
        },
    });

    return (
        <button onClick={open} disabled={!ready} className="plaid-button">
            Conectar cuenta bancaria
        </button>
    );
};

export default PlaidLinkWidget;
