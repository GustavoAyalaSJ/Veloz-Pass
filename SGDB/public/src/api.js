async function obterDadosCarteira(idUsuario) {
    try {
        const response = await auth.request(`/api/payments/wallet-data/${idUsuario}`);

        if (!response || !response.ok) {
            throw new Error("Erro ao buscar dados da carteira");
        }

        return await response.json();

    } catch (error) {
        console.error("Erro na API da carteira:", error);
        return null;
    }
}