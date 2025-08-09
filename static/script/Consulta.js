document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("nome"); // Campo de pesquisa
  const cardsContainer = document.querySelector(".cards"); // Container dos cards
  const subtitle = document.querySelector(".subtitle"); // Texto com número de pontos encontrados

  let todosOsPontos = []; // Lista de todos os pontos da API

  // Função para remover acentos e deixar texto em minúsculo (para o filtro)
  function normalizar(texto) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  // Renderiza os cards na tela
  function renderizarCards(pontos) {
    cardsContainer.innerHTML = ""; // Limpa os cards atuais

    pontos.forEach(ponto => {
      const card = document.createElement("a");
      card.href = `/editar/${ponto.id}`;
      card.classList.add("card");

      const imagemSrc = ponto.imagem
        ? `/uploads/${ponto.imagem}`
        : '/uploads/imagem_padrao';

      card.innerHTML = `
        <img src="${imagemSrc}" alt="${ponto.nome}">
        <h2>${ponto.nome}</h2>
        <p class="category"><strong>${ponto.categorias || 'Sem categorias'}</strong></p>
        <p class="address">
          Endereço: ${ponto.endereco || ''} - ${ponto.complemento || ''}<br>
          CEP: ${ponto.cep || '---'}
        </p>
      `;

      cardsContainer.appendChild(card);
    });

    // Atualiza quantidade no subtítulo
    subtitle.innerHTML = `<strong>${pontos.length} ponto${pontos.length !== 1 ? "s" : ""}</strong> encontrado${pontos.length !== 1 ? "s" : ""}`;
  }

  // Filtra os pontos com base no texto digitado
  function filtrar() {
    const termo = normalizar(input.value.trim());

    const filtrados = todosOsPontos.filter(p => {
      const nome = normalizar(p.nome || '');
      const categoria = normalizar(p.categorias || '');
      const endereco = normalizar(p.endereco || '');
      return nome.includes(termo) || categoria.includes(termo) || endereco.includes(termo);
    });

    renderizarCards(filtrados);
  }

  // Carrega os pontos da API
  fetch('/api/pontos')
    .then(res => res.json())
    .then(pontos => {
      todosOsPontos = pontos;
      renderizarCards(pontos); // Renderiza todos inicialmente
      input.addEventListener("input", filtrar); // Ativa filtro dinâmico
    })
    .catch(error => {
      console.error("Erro ao carregar pontos:", error);
    });
});