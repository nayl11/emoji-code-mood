// Initialisation Supabase
const supabase = window.PRIVATE_CONFIG
  ? supabase.createClient(window.PRIVATE_CONFIG.supabaseUrl, window.PRIVATE_CONFIG.supabaseAnonKey)
  : null;

if (!supabase) console.error("❌ Supabase non configuré !");

let selectedEmoji = null;

// Sélection d'emoji
document.querySelectorAll('.emoji-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedEmoji = btn.dataset.emoji;
    document.querySelectorAll('.emoji-btn').forEach(b => b.style.border = 'none');
    btn.style.border = '2px solid #007bff';
  });
});

// Ajouter un mood
window.addMood = async function(mood) {
  if (!supabase) return false;
  const today = new Date().toISOString().split('T')[0];

  const { data: existing } = await supabase
    .from('employee_moods')
    .select('*')
    .eq('firstName', mood.firstName)
    .eq('lastName', mood.lastName)
    .eq('date', today);

  if (existing && existing.length > 0) return false;

  const { error } = await supabase
    .from('employee_moods')
    .insert([{ ...mood, date: today }]);

  return !error;
};

// Gestion du formulaire
document.getElementById('moodForm').addEventListener('submit', async e => {
  e.preventDefault();
  const mood = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    emoji: selectedEmoji,
    favoriteColor: document.getElementById('favoriteColor').value,
    morningComment: document.getElementById('morningComment').value.trim(),
    eveningComment: document.getElementById('eveningComment').value.trim(),
  };

  if (!mood.emoji) return alert("Veuillez sélectionner votre humeur !");

  const result = await window.addMood(mood);
  if (result) {
    alert("✅ Votre humeur a été enregistrée !");
    e.target.reset();
    selectedEmoji = null;
    document.querySelectorAll('.emoji-btn').forEach(b => b.style.border = 'none');
    loadMoods();
  } else {
    alert("⚠️ Vous avez déjà soumis votre humeur aujourd'hui !");
  }
});

// Charger et afficher les moods
window.loadMoods = async function() {
  if (!supabase) return;
  const { data } = await supabase
    .from('employee_moods')
    .select('*')
    .order('id', { ascending: false });

  const moodList = document.getElementById('moodList');
  if (!data || data.length === 0) {
    moodList.innerHTML = `<p>Pas encore d'humeurs enregistrées...</p>`;
    return;
  }

  // Affichage
  const listDiv = document.createElement('div');
  data.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'employee-entry';
    div.innerHTML = `
      <strong>${entry.firstName} ${entry.lastName}</strong> 
      <span style="color:${entry.favoriteColor}">${entry.emoji}</span><br>
      🌅 Matin: ${entry.morningComment || '-'}<br>
      🌇 Soir: ${entry.eveningComment || '-'}<br>
      <small>${entry.date}</small>
    `;
    listDiv.appendChild(div);
  });
  moodList.appendChild(listDiv);

  // Stats
  const totalParticipants = data.length;
  const moods = [...new Set(data.map(d => d.emoji))];

  document.getElementById('totalParticipants').textContent = totalParticipants;
  document.getElementById('moodVariety').textContent = moods.length;
};

window.addEventListener('DOMContentLoaded', loadMoods);
