document.addEventListener('DOMContentLoaded', () => {
    const peopleGrid = document.getElementById('people-grid');
    const modal = document.getElementById('story-modal');
    const modalImage = document.getElementById('modal-image');
    const modalName = document.getElementById('modal-name');
    const modalRole = document.getElementById('modal-role');
    const modalStory = document.getElementById('modal-story');
    const closeButtons = document.querySelectorAll('[data-close]');

    const searchInput = document.getElementById('search-input');
    const roleFilter = document.getElementById('role-filter');
    const sortOrder = document.getElementById('sort-order');
    const viewToggle = document.getElementById('view-toggle');
    const gridIcon = document.getElementById('grid-icon');
    const listIcon = document.getElementById('list-icon');

    let allPeople = [];
    let state = {
        search: '',
        role: '',
        sort: 'name-asc',
        view: 'grid'
    };

    // Fetch data
    fetch('assets/people.json')
        .then(response => response.json())
        .then(data => {
            allPeople = data;
            populateRoleFilter(data);
            renderPeople();
        })
        .catch(error => console.error('Error loading people data:', error));

    function populateRoleFilter(people) {
        const roles = [...new Set(people.map(p => p.role))].sort();
        roles.forEach(role => {
            const option = document.createElement('option');
            option.value = role;
            option.textContent = role;
            roleFilter.appendChild(option);
        });
    }

    function renderPeople() {
        let filtered = allPeople.filter(person => {
            const matchesSearch = person.name.toLowerCase().includes(state.search.toLowerCase());
            const matchesRole = state.role === '' || person.role === state.role;
            return matchesSearch && matchesRole;
        });

        filtered.sort((a, b) => {
            if (state.sort === 'name-asc') {
                return a.name.localeCompare(b.name);
            } else {
                return b.name.localeCompare(a.name);
            }
        });

        peopleGrid.innerHTML = filtered.map(person => `
            <article class="person-card" data-id="${person.id}">
                <img src="${person.image}" alt="${person.name}" class="card-image" loading="lazy">
                <div class="card-info">
                    <h3 class="card-name">${person.name}</h3>
                    <span class="card-role">${person.role}</span>
                </div>
            </article>
        `).join('');

        // Re-attach listeners
        document.querySelectorAll('.person-card').forEach(card => {
            card.addEventListener('click', () => {
                const personId = parseInt(card.dataset.id);
                const person = allPeople.find(p => p.id === personId);
                openModal(person);
            });
        });
    }

    // Event Listeners
    searchInput.addEventListener('input', (e) => {
        state.search = e.target.value;
        renderPeople();
    });

    roleFilter.addEventListener('change', (e) => {
        state.role = e.target.value;
        renderPeople();
    });

    sortOrder.addEventListener('change', (e) => {
        state.sort = e.target.value;
        renderPeople();
    });

    viewToggle.addEventListener('click', () => {
        state.view = state.view === 'grid' ? 'list' : 'grid';
        peopleGrid.classList.toggle('list-view');
        gridIcon.classList.toggle('hidden');
        listIcon.classList.toggle('hidden');
    });

    function openModal(person) {
        if (!person) return;

        modalImage.src = person.image;
        modalImage.alt = person.name;
        modalName.textContent = person.name;
        modalRole.textContent = person.role;
        modalStory.textContent = person.story;

        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    function closeModal() {
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    // Close modal listeners
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
            closeModal();
        }
    });
});
