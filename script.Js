const API_URL = 'https://jsonplaceholder.typicode.com/users';

const statusElement = document.getElementById('status');
const appContent = document.getElementById('app-content');
const searchInput = document.getElementById('search-input');
const clientGrid = document.getElementById('client-grid');
const chartCanvas = document.getElementById('clients-chart');

let clients = [];
let chart = null;

function showError(message) {
  statusElement.hidden = false;
  statusElement.className = 'status-message error-message';
  statusElement.textContent = `Erro: ${message}`;
  appContent.hidden = true;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderClients(filteredClients) {
  if (filteredClients.length === 0) {
    clientGrid.innerHTML = '<p class="no-results">Nenhum cliente encontrado com este nome.</p>';
    return;
  }

  clientGrid.innerHTML = filteredClients.map((client) => `
    <article class="client-card">
      <h3>${escapeHtml(client.name)}</h3>
      <p><strong>E-mail:</strong> ${escapeHtml(client.email)}</p>
      <p><strong>Telefone:</strong> ${escapeHtml(client.phone)}</p>
      <p><strong>Cidade:</strong> ${escapeHtml(client.address?.city || 'Não informado')}</p>
      <p><strong>Empresa:</strong> ${escapeHtml(client.company?.name || 'Não informado')}</p>
    </article>
  `).join('');
}

function getCityCounts(filteredClients) {
  const cityCounts = {};

  filteredClients.forEach((client) => {
    const city = client.address?.city || 'Não informado';
    cityCounts[city] = (cityCounts[city] || 0) + 1;
  });

  return cityCounts;
}

function renderChart(filteredClients) {
  const cityCounts = getCityCounts(filteredClients);

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(chartCanvas, {
    type: 'bar',
    data: {
      labels: Object.keys(cityCounts),
      datasets: [{
        label: 'Quantidade de Clientes',
        data: Object.values(cityCounts),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Distribuição de Clientes por Cidade'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

function updateDashboard() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm)
  );

  renderClients(filteredClients);
  renderChart(filteredClients);
}

async function loadClients() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error('Falha ao carregar os dados dos clientes.');
    }

    clients = await response.json();

    statusElement.hidden = true;
    appContent.hidden = false;
    updateDashboard();
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : 'Não foi possível carregar os dados.';

    showError(message);
  }
}

searchInput.addEventListener('input', updateDashboard);

loadClients();
