let map, marker;
let enderecoAtual = '';

// ============================
// INICIALIZAÇÃO DO MAPA COM LOCALIZAÇÃO DO USUÁRIO
// ============================
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      map = L.map('map', {
        center: [latitude, longitude],
        zoom: 16,
        minZoom: 10,
        maxZoom: 19
      });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 10,
        maxZoom: 19,
      }).addTo(map);

      marker = L.marker([latitude, longitude]).addTo(map);

      buscarEnderecoPorCoordenadas(latitude, longitude);

      map.on('click', async function (e) {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        buscarEnderecoPorCoordenadas(lat, lng);
      });
    },
    function () {
      alert("Não foi possível obter sua localização. Verifique se o acesso à geolocalização está permitido.");
    }
  );
} else {
  alert("Geolocalização não é suportada pelo seu navegador.");
}

// ============================
// FUNÇÃO PARA BUSCAR ENDEREÇO PELO MAPA
// ============================
async function buscarEnderecoPorCoordenadas(lat, lon) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`);
    const data = await response.json();

    if (data?.address?.postcode) {
      document.getElementById('cep').value = data.address.postcode;
    }

    if (data?.address) {
      const rua = data.address.road || '';
      const bairro = data.address.suburb || '';
      const cidade = data.address.city || data.address.town || data.address.village || '';
      const estado = data.address.state || '';
      enderecoAtual = `${rua}, ${bairro}, ${cidade}, ${estado}`;
    }
  } catch (error) {
    console.error("Erro ao buscar endereço por coordenadas:", error);
    alert("Erro ao tentar obter o endereço.");
  }
}

// ============================
// EVENTOS AO CARREGAR A PÁGINA
// ============================
document.addEventListener("DOMContentLoaded", () => {

  const whatsappInput = document.getElementById("whatsapp");
  const cepInput = document.getElementById("cep");

  // ========== Máscara WhatsApp ==========
  if (whatsappInput) {
    IMask(whatsappInput, { mask: '(00) 00000-0000' });
  }

  // ========== Máscara CEP + Buscar endereço ==========
  if (cepInput) {
    IMask(cepInput, { mask: '00000-000' });

    cepInput.addEventListener('blur', async () => {
      const cep = cepInput.value.replace(/\D/g, '');
      if (cep.length === 8) {
        try {
          const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
          const data = await response.json();

          if (!data.erro) {
            enderecoAtual = `${data.logradouro}, ${data.localidade}, ${data.uf}`;

            const location = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoAtual)}`);
            const geo = await location.json();

            if (geo.length > 0) {
              const { lat, lon } = geo[0];
              map.setView([lat, lon], 16);
              marker.setLatLng([lat, lon]);
            } else {
              alert("Localização não encontrada.");
            }
          } else {
            alert("CEP não encontrado.");
          }
        } catch (err) {
          alert("Erro ao buscar endereço.");
          console.error(err);
        }
      }
    });
  }

  // ========== Marcação visual dos checkboxes ==========
  const itemLabels = document.querySelectorAll('.items-grid .item');

  itemLabels.forEach(label => {
    const checkbox = label.querySelector('input[type="checkbox"]');

    checkbox.addEventListener('change', () => {
      label.classList.toggle('selected', checkbox.checked);
    });

    if (checkbox.checked) {
      label.classList.add('selected');
    }
  });

  // ========== Preview da imagem ==========
  const fileInput = document.getElementById('fileInput');
  const uploadDiv = document.getElementById('uploadDiv');
  const previewImg = document.getElementById('preview');
  const previewText = document.getElementById('previewText');
  const removeImageBtn = document.getElementById('removeImageBtn');

  fileInput?.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        uploadDiv.style.backgroundImage = `url('${e.target.result}')`;

        previewImg.style.display = 'none';
        previewText.style.display = 'none';
        removeImageBtn.style.display = 'block';

        uploadDiv.classList.add('sem-borda');
      }
      reader.readAsDataURL(file);
    }
  });

  removeImageBtn?.addEventListener('click', function () {
    uploadDiv.style.backgroundImage = '';
    previewImg.style.display = 'block';
    previewText.style.display = 'block';
    removeImageBtn.style.display = 'none';
    fileInput.value = '';
    uploadDiv.classList.remove('sem-borda');
  });

  // ========== Evita envio com Enter ==========
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        input.blur();
      }
    });
  });

  // ========== Envio do formulário ==========
  const botaoCadastrar = document.querySelector('.button-submit');
  const modal = document.getElementById('success-modal');

  if (botaoCadastrar) {
    document.querySelector('form').addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData();

      formData.append('nome', document.getElementById("nome").value);
      formData.append('email', document.getElementById("email").value);
      formData.append('whatsapp', document.getElementById("whatsapp").value);
      formData.append('cep', document.getElementById("cep").value);
      formData.append('complemento', document.getElementById("complemento").value);
      formData.append('endereco', enderecoAtual);

      if (marker) {
        const latlng = marker.getLatLng();
        formData.append('latitude', latlng.lat);
        formData.append('longitude', latlng.lng);
      }

      const imagemInput = document.getElementById("fileInput");
      if (imagemInput?.files.length > 0) {
        formData.append('imagem', imagemInput.files[0]);
      }

      const checkboxes = document.querySelectorAll('.items-grid input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
          formData.append(checkbox.name, 'on');
        }
      });

      try {
        const response = await fetch('/cadastrar', {
          method: 'POST',
          body: formData,
        });

        const resultado = await response.json();
        console.log("Resposta do servidor:", resultado);

        if (response.ok) {
          modal.classList.remove('hidden');

          setTimeout(() => {
            modal.classList.add('hidden');
            window.location.href = '/consultar';
          }, 2000);
        } else {
          alert(resultado.erro || "Erro ao cadastrar.");
        }
      } catch (err) {
        console.error("Erro ao enviar dados:", err);
        alert("Falha ao enviar os dados.");
      }
    });
  }
});