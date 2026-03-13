async function obterDadosCarteira(idUsuario) {
    try {
        console.log(`Buscando carteira para id_usuario: ${idUsuario}`);
        const response = await auth.request(`/api/payments/wallet-data/${idUsuario}`);

        if (!response || !response.ok) {
            console.error(`Erro HTTP ${response?.status}:`, response?.statusText);
            throw new Error(`Erro ao buscar dados da carteira (${response?.status})`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Erro na API da carteira:", error);
        return null;
    }
}