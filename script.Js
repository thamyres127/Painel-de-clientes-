const API_URL = 'https://jsonplaceholder.typicode.com/users';

const fallbackClients = [
  { id: 1, name: 'Leanne Graham', email: 'Sincere@april.biz', phone: '1-770-736-8031 x56442', address: { city: 'Gwenborough' }, company: { name: 'Romaguera-Crona' } },
  { id: 2, name: 'Ervin Howell', email: 'Shanna@melissa.tv', phone: '010-692-6593 x09125', address: { city: 'Wisokyburgh' }, company: { name: 'Deckow-Crist' } },
  { id: 3, name: 'Clementine Bauch', email: 'Nathan@yesenia.net', phone: '1-463-123-4447', address: { city: 'McKenziehaven' }, company: { name: 'Romaguera-Jacobson' } },
  { id: 4, name: 'Patricia Lebsack', email: 'Julianne.OConner@kory.org', phone: '493-170-9623 x156', address: { city: 'South Elvis' }, company: { name: 'Robel-Corkery' } },
  { id: 5, name: 'Chelsey Dietrich', email: 'Lucio_Hettinger@annie.ca', phone: '(254)954-1289', address: { city: 'Roscoeview' }, company: { name: 'Keebler LLC' } },
  { id: 6, name: 'Mrs. Dennis Schulist', email: 'Karley_Dach@jasper.info', phone: '1-477-935-8478 x6430', address: { city: 'South Christy' }, company: { name: 'Considine-Lockman' } },
  { id: 7, name: 'Kurtis Weissnat', email: 'Telly.Hoeger@billy.biz', phone: '210.067.6132', address: { city: 'Howemouth' }, company: { name: 'Johns Group' } },
  { id: 8, name: 'Nicholas Runolfsdottir V', email: 'Sherwood_Kuhic@annie.ca', phone: '586.493.6943 x140', address: { city: 'Aliyaview' }, company: { name: 'Abernathy Group' } },
  { id: 9, name: 'Glenna Reichert', email: 'sierra.mosciski@gmail.com', phone: '(775)976-6794 x41206', address: { city: 'Bartholomebury' }, company: { name: 'Yost and Sons' } },
  { id: 10, name: 'Clementina DuBuque', email: 'Elvis.Weber@earthlink.net', phone: '024-648-3804', address: { city: 'Lebsackbury' }, company: { name: 'Hoeger LLC' } }
];

let clients = [];

const searchInput = document.getElementById('searchInput');
const statusMessage = document.getElementById('statusMessage');
const content = document.getElementById('content');
const clientGrid = document.getElementById('clientGrid');
const cityChart = document.getElementById('cityChart');

function normalizeClients(data) {
  if (!Array.isArray(data)) throw new Error('Formato de dados inválido.');
  return data;
}

async function loadClients() {
  statusMessage.className = 'status-message';
  statusMessage.textContent = 'Carregando dados dos clientes...';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(API_URL, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) throw new Error('Falha ao carregar os dados dos clientes.');
    clients = normalizeClients(await response.json());
    statusMessage.hidden = true;
  } catch (error) {
    // O painel continua funcionando mesmo se a API externa estiver indisponível.
    clients = fallbackClients;
    statusMessage.hidden = true;
    console.warn('API indisponível; usando dados locais de demonstração.', error);
  }

  content.hidden = false;
  render();
}

function render() {
  const term = searchInput.value.trim().toLowerCase();
  const filtered = clients.filter(client => client.name.toLowerCase().includes(term));
  renderChart(filtered);
  renderCards(filtered);
}

function renderCards(filtered) {
  clientGrid.innerHTML = '';

  if (!filtered.length) {
    const message = document.createElement('p');
    message.className = 'no-results';
    message.textContent = 'Nenhum cliente encontrado com este nome.';
    clientGrid.appendChild(message);
    return;
  }

  filtered.forEach(client => {
    const card = document.createElement('article');
    card.className = 'client-card';
    card.innerHTML = `
      <h3>${escapeHtml(client.name)}</h3>
      <p><strong>E-mail:</strong> ${escapeHtml(client.email)}</p>
      <p><strong>Telefone:</strong> ${escapeHtml(client.phone)}</p>
      <p><strong>Cidade:</strong> ${escapeHtml(client.address.city)}</p>
      <p><strong>Empresa:</strong> ${escapeHtml(client.company.name)}</p>
    `;
    clientGrid.appendChild(card);
  });
}

function renderChart(filtered) {
  cityChart.innerHTML = '';
  const counts = {};
  filtered.forEach(client => {
    const city = client.address.city;
    counts[city] = (counts[city] || 0) + 1;
  });

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = entries.length ? Math.max(...entries.map(([, count]) => count)) : 1;

  entries.forEach(([city, count]) => {
    const row = document.createElement('div');
    row.className = 'chart-row';
    row.innerHTML = `
      <span>${escapeHtml(city)}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(count / max) * 100}%"></div></div>
      <strong>${count}</strong>
    `;
    cityChart.appendChild(row);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

searchInput.addEventListener('input', render);
loadClients();
