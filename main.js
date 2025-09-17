// Initialisation Supabase
const supabase = supabase.createClient(window.PRIVATE_CONFIG.supabaseUrl, window.PRIVATE_CONFIG.supabaseAnonKey);

let selectedEmoji = null;

// Gestion des emojis
document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        selectedEmoji = btn.dataset.emoji;
        document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    });
});

// Fonction pour ajouter un mood
async function addMood(mood) {
    const today = new Date().toISOString().split('T')[0];

    const { data: existing } = await supabase
        .from('employee_moods')
        .select('*')
        .eq('firstName', mood.firstName)
        .eq('lastName', mood.lastName)
        .eq('date', today);

    if (existing && existing.length > 0) return false;

    const { data, error } = await supabase
        .from('employee_moods')
        .insert([{ ...mood, date: today }]);

    if (error) {
        console.error("Erreur insertion:", error);
        return false;
    }

    return true;
}

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

    if (!mood.emoji) {
        alert("Veuillez sélectionner votre humeur !");
        return;
    }

    const success = await addMood(mood);
    if (success) {
        alert("✅ Humeur enregistrée !");
        e.target.reset();
        selectedEmoji = null;
        document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
        loadMoods();
    } else {
        alert("⚠️ Vous avez déjà soumis votre humeur aujourd'hui !");
    }
});

// Chargement des moods
async function loadMoods() {
    const { data, error } = await supabase
        .from('employee_moods')
        .select('*')
        .order('id', { ascending: false });

    const moodList = document.getElementById('moodList');
    if (error) {
        moodList.innerHTML = `<p>Erreur de chargement</p>`;
        return;
    }

    if (!data || data.length === 0) {
        moodList.innerHTML = `<p>Pas encore d'humeurs enregistrées...</p>`;
        return;
    }

    moodList.innerHTML = '';
    data.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'social-post new-item';
        div.innerHTML = `
            <div class="post-header">
                <div class="user-info">
                    <div class="avatar-letter" style="background:${entry.favoriteColor}">${entry.firstName[0]}${entry.lastName[0]}</div>
                    <div class="user-details">
                        <span class="username">${entry.firstName} ${entry.lastName}</span>
                        <small class="post-time">${entry.date}</small>
                    </div>
                </div>
                <span class="post-mood">${entry.emoji}</span>
            </div>
            <div class="post-content">
                🌅 ${entry.morningComment || '-'}<br>
                🌇 ${entry.eveningComment || '-'}
            </div>
        `;
        moodList.appendChild(div);
    });
}

// Auto load
window.addEventListener('DOMContentLoaded', loadMoods);
