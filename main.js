// main.js

// ⚠️ Assure-toi que tu as ce script dans ton HTML avant main.js :
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.35.1/dist/supabase.min.js"></script>

// Initialisation Supabase
if (!window.PRIVATE_CONFIG) {
    console.error("❌ PRIVATE_CONFIG n'est pas défini !");
}

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
        document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    });
});

// Ajouter un mood dans Supabase
async function addMood(mood) {
    if (!supabase) return false;

    const today = new Date().toISOString().split('T')[0];

    // Vérification doublon
    const { data: existing, error: selErr } = await supabase
        .from('employee_moods')
        .select('*')
        .eq('firstName', mood.firstName)
        .eq('lastName', mood.lastName)
        .eq('date', today);

    if (selErr) console.error("Erreur check doublon:", selErr);

    if (existing && existing.length > 0) {
        console.warn("⚠️ Doublon détecté :", mood.firstName, mood.lastName);
        return false;
    }

    // Insertion
    const { data, error } = await supabase
        .from('employee_moods')
        .insert([{ ...mood, date: today }]);

    if (error) {
        console.error("❌ Erreur ajout mood:", error);
        return false;
    }

    return true;
}

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

    const result = await addMood(mood);
    if (result) {
        alert("✅ Votre humeur a été enregistrée !");
        e.target.reset();
        selectedEmoji = null;
        document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
        loadMoods();
    } else {
        alert("⚠️ Vous avez déjà soumis votre humeur aujourd'hui !");
    }
});

// Charger les moods
async function loadMoods() {
    if (!supabase) return;

    const { data, error } = await supabase
        .from('employee_moods')
        .select('*')
        .order('id', { ascending: false });

    const moodList = document.getElementById('moodList');

    if (error) {
        moodList.innerHTML = `<p>❌ Erreur lors du chargement des humeurs</p>`;
        console.error(error);
        return;
    }

    if (!data || data.length === 0) {
        moodList.innerHTML = `<p>Pas encore d'humeurs enregistrées...</p>`;
        return;
    }

    // Affichage des participants
    moodList.innerHTML = '';
    data.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'social-post new-item';
        div.innerHTML = `
            <div class="post-header">
                <div class="user-info">
                    <div class="avatar">
                        <div class="avatar-letter">${entry.firstName[0]}${entry.lastName[0]}</div>
                    </div>
                    <div class="user-details">
                        <div class="username">${entry.firstName} ${entry.lastName}</div>
                    </div>
                </div>
                <div class="post-mood" style="color:${entry.favoriteColor}">${entry.emoji}</div>
            </div>
            <div class="post-content">
                🌅 Matin: ${entry.morningComment || '-'}<br>
                🌇 Soir: ${entry.eveningComment || '-'}<br>
                <small>${entry.date}</small>
            </div>
        `;
        moodList.appendChild(div);
    });
}

// Charger automatiquement au démarrage
window.addEventListener('DOMContentLoaded', () => {
    loadMoods();
});
