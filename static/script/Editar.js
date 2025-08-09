// ============================
// VARIÁVEIS GLOBAIS
// ============================
let map, marker;
let enderecoAtual = '';

// ============================
// INICIALIZAÇÃO DO MAPA
// ============================
document.addEventListener("DOMContentLoaded", () => {
  const lat = parseFloat("{{ ponto.latitude }}");
  const lon = parseFloat("{{ ponto.longitude }}");

  if (!isNaN(lat) && !isNaN(lon)) {
    inicializarMapa(lat, lon);
    atualizarEnderecoPorCoordenadas(lat, lon); // Preenche o endereço automaticamente
  } else {
    inicializarMapa(-23.5565, -46.6626);
  }
});

function inicializarMapa(latitude, longitude) {
  map = L.map('map').setView([latitude, longitude], 16);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  marker = L.marker([latitude, longitude]).addTo(map);

  map.on('click', async function (e) {
    const { lat, lng } = e.latlng;
    marker.setLatLng([lat, lng]);
    await atualizarEnderecoPorCoordenadas(lat, lng);
  });
}

async function atualizarEnderecoPorCoordenadas(lat, lng) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
    const data = await response.json();

    if (data?.address?.postcode) {
      document.getElementById('cep').value = data.address.postcode;
    }

    const { road = '', suburb = '', city = '', town = '', village = '', state = '' } = data.address || {};
    enderecoAtual = `${road}, ${suburb}, ${city || town || village}, ${state}`;
    document.getElementById('endereco').value = enderecoAtual;
  } catch {
    alert("Erro ao obter o endereço.");
  }
}

// ============================
// MÁSCARAS DE INPUT
// ============================
document.addEventListener("DOMContentLoaded", () => {
  IMask(document.getElementById("whatsapp"), { mask: '(00) 00000-0000' });
  IMask(document.getElementById("cep"), { mask: '00000-000' });
});

// ============================
// BUSCA DE ENDEREÇO PELO CEP
// ============================
document.getElementById('cep')?.addEventListener('blur', async () => {
  const cep = document.getElementById('cep').value.replace(/\D/g, '');
  if (cep.length === 8) {
    try {
      const viaCep = await fetch(`https://viacep.com.br/ws/${cep}/json/`).then(r => r.json());

      if (!viaCep.erro) {
        const enderecoBusca = `${viaCep.logradouro}, ${viaCep.localidade}, ${viaCep.uf}`;
        const geo = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoBusca)}`).then(r => r.json());

        if (geo.length > 0) {
          const { lat, lon } = geo[0];
          map.setView([lat, lon], 16);
          marker.setLatLng([lat, lon]);
          enderecoAtual = `${viaCep.logradouro}, ${viaCep.bairro || ''}, ${viaCep.localidade}, ${viaCep.uf}`;
          document.getElementById('endereco').value = enderecoAtual;
        }
      } else {
        alert("CEP não encontrado.");
      }
    } catch {
      alert("Erro ao buscar endereço.");
    }
  }
});

// ============================
// UPLOAD DE IMAGEM COM PREVIEW
// ============================
document.addEventListener("DOMContentLoaded", () => {
  const uploadDiv = document.getElementById("uploadDiv");
  const previewImg = document.getElementById("preview");
  const previewText = document.getElementById("previewText");
  const fileInput = document.getElementById("fileInput");
  const removeImageBtn = document.getElementById("removeImageBtn");
  const imagemRemovidaInput = document.getElementById("imagemRemovida");

  const bgImage = uploadDiv.style.backgroundImage;
  const isImagemPadrao = bgImage.includes('imagem_padrao.png');

  if (bgImage && !isImagemPadrao) {
    removeImageBtn.style.display = 'block';
    previewImg.style.display = 'none';
    previewText.style.display = 'none';
    uploadDiv.classList.add("sem-borda");
  }

  fileInput?.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        uploadDiv.style.backgroundImage = `url(${e.target.result})`;
        previewImg.style.display = 'none';
        previewText.style.display = 'none';
        removeImageBtn.style.display = 'block';
        uploadDiv.classList.add("sem-borda");
        imagemRemovidaInput.value = 'false';
      };
      reader.readAsDataURL(file);
    }
  });

  removeImageBtn?.addEventListener("click", () => {
    uploadDiv.style.backgroundImage = '';
    previewImg.style.display = 'block';
    previewText.style.display = 'block';
    removeImageBtn.style.display = 'none';
    uploadDiv.classList.remove('sem-borda');
    fileInput.value = '';
    imagemRemovidaInput.value = 'true';
  });
});

// ============================
// CONTROLE DE CHECKBOXES
// ============================
document.querySelectorAll('.items-grid .item').forEach(label => {
  const checkbox = label.querySelector('input[type="checkbox"]');
  label.classList.toggle('selected', checkbox.checked);
  label.addEventListener('click', () => {
    checkbox.checked = !checkbox.checked;
    label.classList.toggle('selected', checkbox.checked);
  });
});

// ============================
// BOTÕES: ALTERAR E DELETAR
// ============================
const btnDeletar = document.getElementById("btn-deletar");
const btnAlterar = document.querySelector(".button-submit");

btnAlterar?.addEventListener("click", async (e) => {
  e.preventDefault();
  const pontoId = btnDeletar?.dataset.id;
  if (!document.getElementById('endereco').value) {
    alert('Por favor, selecione um endereço no mapa ou preencha o CEP corretamente.');
    return;
  }
  if (pontoId) {
    await alterarPonto(pontoId);
  }
});

btnDeletar?.addEventListener("click", async () => {
  const pontoId = btnDeletar.dataset.id;
  await deletarPonto(pontoId);
});

// ============================
// FUNÇÃO: ALTERAR PONTO
// ============================
async function alterarPonto(pontoId) {
  try {
    const formData = new FormData();
    formData.append('nome', document.getElementById("nome").value);
    formData.append('email', document.getElementById("email").value);
    formData.append('whatsapp', document.getElementById("whatsapp").value);
    formData.append('cep', document.getElementById("cep").value);
    formData.append('complemento', document.getElementById("complemento").value);
    formData.append('endereco', document.getElementById('endereco').value);

    const imagemRemovida = document.getElementById("imagemRemovida").value;
    formData.append('imagemRemovida', imagemRemovida);

    if (marker) {
      const { lat, lng } = marker.getLatLng();
      formData.append('latitude', lat);
      formData.append('longitude', lng);
    }

    const fileInput = document.getElementById("fileInput");
    if (fileInput?.files.length > 0) {
      formData.append('imagem', fileInput.files[0]);
    }

    document.querySelectorAll('.items-grid input[type="checkbox"]').forEach(input => {
      formData.append(input.name, input.checked ? 'on' : '');
    });

    const res = await fetch(`/editar/${pontoId}`, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (res.ok) {
      mostrarSucesso("Ponto de coleta atualizado com sucesso!");
      setTimeout(() => window.location.href = "/consultar", 2000);
    } else {
      alert(data.erro || "Erro ao atualizar.");
    }
  } catch {
    alert("Erro ao tentar atualizar.");
  }
}

// ============================
// FUNÇÃO: DELETAR PONTO
// ============================
async function deletarPonto(pontoId) {
  try {
    const res = await fetch(`/remover/${pontoId}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      mostrarSucesso("Ponto de coleta removido com sucesso!");
      setTimeout(() => window.location.href = "/consultar", 2000);
    } else {
      alert(data.erro || "Erro ao deletar ponto.");
    }
  } catch {
    alert("Erro ao tentar deletar.");
  }
}

// ============================
// MODAL DE SUCESSO
// ============================
function mostrarSucesso(msg) {
  const successModal = document.getElementById("success-modal");
  const successMessage = document.getElementById("success-message");
  successMessage.textContent = msg;
  successModal.classList.remove("hidden");
  setTimeout(() => {
    successModal.classList.add("hidden");
  }, 2500);
}