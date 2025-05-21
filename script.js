document.addEventListener('DOMContentLoaded', () => {
    const pagamentoSelect = document.getElementById('pagamento');
    if (!pagamentoSelect) {
        console.error("Elemento #pagamento não encontrado");
        return;
    }

    pagamentoSelect.addEventListener('change', function() {
        const valorPagoLabel = document.getElementById('valorPagoLabel');
        const valorPagoInput = document.getElementById('valorPago');
        if (!valorPagoLabel || !valorPagoInput) {
            console.error("Elementos #valorPagoLabel ou #valorPago não encontrados");
            return;
        }
        if (this.value === 'Dinheiro') {
            valorPagoLabel.style.display = 'block';
            valorPagoInput.style.display = 'block';
            valorPagoInput.required = true;
            valorPagoInput.value = '';
        } else {
            valorPagoLabel.style.display = 'none';
            valorPagoInput.style.display = 'none';
            valorPagoInput.required = false;
            valorPagoInput.value = '';
        }
    });

    atualizarProducao();
    atualizarImpressao();
    atualizarRelatorioEntregadores();
    atualizarDashboard();
});

const entregas = [];

function registrarEntrega() {
    try {
        const inputs = {
            entregador: document.getElementById("entregador"),
            nomeCliente: document.getElementById("nomeCliente"),
            telefoneCliente: document.getElementById("telefoneCliente"),
            endereco: document.getElementById("endereco"),
            produtos: document.getElementById("produtos"),
            valor: document.getElementById("valor"),
            pagamento: document.getElementById("pagamento"),
            valorPago: document.getElementById("valorPago"),
            data: document.getElementById("data")
        };

        for (const [key, element] of Object.entries(inputs)) {
            if (!element) {
                throw new Error(`Elemento #${key} não encontrado`);
            }
        }

        const entregador = inputs.entregador.value.trim();
        const nomeCliente = inputs.nomeCliente.value.trim();
        const telefoneCliente = inputs.telefoneCliente.value.trim();
        const endereco = inputs.endereco.value.trim();
        const produtos = inputs.produtos.value.trim();
        const valorRaw = inputs.valor.value.trim();
        const pagamento = inputs.pagamento.value;
        const valorPagoRaw = pagamento === "Dinheiro" ? (inputs.valorPago.value.trim() || "0") : "0";
        const data = inputs.data.value;

        const valor = parseFloat(valorRaw.replace(',', '.'));
        const valorPago = parseFloat(valorPagoRaw.replace(',', '.')) || 0;

        const validationErrors = [];
        if (!entregador) validationErrors.push("Entregador está vazio");
        if (!nomeCliente) validationErrors.push("Nome do Cliente está vazio");
        if (!telefoneCliente) validationErrors.push("Telefone do Cliente está vazio");
        if (!endereco) validationErrors.push("Endereço está vazio");
        if (!produtos) validationErrors.push("Produtos está vazio");
        if (!valorRaw || isNaN(valor) || valor <= 0) validationErrors.push("Valor é inválido, vazio ou menor/igual a zero");
        if (!pagamento) validationErrors.push("Forma de Pagamento não selecionada");
        if (pagamento === "Dinheiro") {
            if (!valorPagoRaw || isNaN(valorPago)) validationErrors.push("Valor Pago é inválido ou vazio");
            else if (valorPago < valor) validationErrors.push(`Valor Pago (R$${valorPago.toFixed(2)}) é menor que o Valor (R$${valor.toFixed(2)})`);
        }
        if (!data) validationErrors.push("Data não selecionada");

        if (validationErrors.length > 0) {
            alert(`Erro: ${validationErrors.join("; ")}.`);
            return;
        }

        const troco = pagamento === "Dinheiro" ? Math.max(0, valorPago - valor) : 0;

        const entrega = {
            id: Date.now(),
            entregador,
            nomeCliente,
            telefoneCliente,
            endereco,
            produtos,
            valor,
            pagamento,
            valorPago,
            troco,
            data,
            status: 'producao' // Novo campo para rastrear o status
        };

        entregas.push(entrega);
        alert("Entrega registrada com sucesso!");
        atualizarProducao();
        atualizarRelatorioEntregadores();
        atualizarDashboard();
        document.getElementById("registro").querySelectorAll("input, select").forEach(input => input.value = "");
    } catch (error) {
        console.error("Erro ao registrar entrega:", error.message);
        const errorDiv = document.getElementById("dashboard-error");
        if (errorDiv) {
            errorDiv.style.display = "block";
            errorDiv.textContent = `Erro ao registrar entrega: ${error.message}`;
        }
    }
}

function atualizarProducao() {
    const producaoLista = document.getElementById("producao-lista");
    if (!producaoLista) return;

    const pedidosProducao = entregas.filter(p => p.status === 'producao');
    if (pedidosProducao.length === 0) {
        producaoLista.innerHTML = "<p>Nenhum pedido em produção.</p>";
        return;
    }

    let html = "";
    pedidosProducao.forEach((entrega, index) => {