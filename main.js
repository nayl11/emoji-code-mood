// Initialisation Supabase
const supabase = window.PRIVATE_CONFIG
  ? supabase.createClient(window.PRIVATE_CONFIG.supabaseUrl, window.PRIVATE_CONFIG.supabaseAnonKey)
  : null;

if (!supabase) {
  console.error("❌ Supabase non configuré !");
}

// Variables globales
let selectedEmoji = null;

// Gestion de la sélection d'emoji
document.querySelectorAll('.emoji-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedEmoji = btn.dataset.emoji;
    document.querySelectorAll('.emoji-btn').forEach(b => b.style.border = 'none');
    btn.style.border = '2px solid #007bff';
  });
});

// Fonction pour ajouter un mood
window.addMood = async function(mood) {
  if (!supabase) return false;

  // Vérification anti-doublon (Nom + Prénom + Date)
  const today = new Date().toISOString().split('T')[0];
  const { data: existing, error } = await supabase
    .from('employee_moods')
    .select('*')
    .eq('firstName', mood.firstName)
    .eq('lastName', mood.lastName)
    .eq('date', today);

  if (existing && existing.length > 0) {
    console.warn("⚠️ Doublon détecté :", mood.firstName, mood.lastName);
    return false;
  }

  // Insertion dans Supabase
  const { data, error: insertError } = await supabase
    .from('employee_moods')
    .insert([{ ...mood, date: today }]);

  if (insertError) {
    console.error("❌ Erreur lors de l'ajout du mood :", insertError);
    return false;
  }

  return true;
};

// Gestion du formulaire
document.getElementById('moodForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const mood = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    emoji: selectedEmoji,
    favoriteColor: document.getElementById('favoriteColor').value,
    morningComment: document.getElementById('morningComment').value.trim(),
    eveningComment: document.getElementById('eveningComment').value.trim(),
  };

  if (!mood.emoji) {
    alert("Veuillez sélectionner votre humeur !");
    return;
  }

  const result = await window.addMood(mood);
  if (result) {
    alert("✅ Votre humeur a été enregistrée !");
    e.target.reset();
    selectedEmoji = null;
    document.querySelectorAll('.emoji-btn').forEach(b => b.style.border = 'none');
    loadMoods(); // Met à jour la liste
  } else {
    alert("⚠️ Vous avez déjà soumis votre humeur aujourd'hui !");
  }
});

// Fonction pour charger les moods
window.loadMoods = async function() {
  if (!supabase) return;

  const { data, error } = await supabase
    .from('employee_moods')
    .select('*')
    .order('id', { ascending: false });

  const moodList = document.getElementById('moodList');
  if (error) {
    moodList.innerHTML = `<p>❌ Erreur lors du chargement des humeurs</p>`;
    return;
  }

  if (!data || data.length === 0) {
    moodList.innerHTML = `<p>Pas encore d'humeurs enregistrées...</p>`;
    return;
  }

  // Affichage des humeurs
  moodList.innerHTML = '';
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
    moodList.appendChild(div);
  });

  // Statistiques simples
  updateStats(data);
};

// Calcul des statistiques
function updateStats(data) {
  const totalParticipants = data.length;
  const emojiCounts = {};
  const colorCounts = {};

  data.forEach(d => {
    emojiCounts[d.emoji] = (emojiCounts[d.emoji] || 0) + 1;
    colorCounts[d.favoriteColor] = (colorCounts[d.favoriteColor] || 0) + 1;
  });

  console.log("📊 Statistiques :", {
    totalParticipants,
    emojiCounts,
    colorCounts
  });
}

// Charger automatiquement au démarrage
window.addEventListener('DOMContentLoaded', () => {
  loadMoods();
});
