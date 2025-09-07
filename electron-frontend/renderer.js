// ... Logique JS pour la sélection des cartes et communication avec le backend ...
let playerHand = [];
let dealerCard = 'A';
let playerRotation = 0;
let dealerRotation = 0;

// Toutes les cartes disponibles
const allCards = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

// Éléments de l'interface
const playerHandDisplay = document.getElementById('player-hand-display');
const dealerSelected = document.getElementById('dealer-selected');
const actionBlock = document.getElementById('action-block');
const checkBtn = document.getElementById('check-btn');
const resetBtn = document.getElementById('reset-btn');
const playerValueDiv = document.getElementById('player-value');

// Cercles de cartes
const playerCircle = document.getElementById('player-circle');
const dealerCircle = document.getElementById('dealer-circle');

function getHandValue(hand) {
  let values = hand.map(card => {
    if (card === 'A') return 11;
    if (['K','Q','J'].includes(card)) return 10;
    return parseInt(card);
  });
  let total = values.reduce((a, b) => a + b, 0);
  let aces = hand.filter(card => card === 'A').length;
  // Ajustement des As si dépassement de 21
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function positionCards() {
  const totalCards = allCards.length;
  const step = 360 / totalCards;
  const visibleCount = 7;
  const radiusDealer = 140; // Ajusté pour que l'arc visible colle au bord haut
  const radiusPlayer = 140; // Ajusté pour que l'arc visible colle au bord bas

  // Helper pour calculer le centre (x,y) relatif au conteneur de cercle, basé sur l'avatar
  function computeCenter(containerEl) {
    const avatarEl = containerEl.parentElement.querySelector('.center-avatar');
    const contRect = containerEl.getBoundingClientRect();
    const avRect = avatarEl.getBoundingClientRect();
    const cx = avRect.left + avRect.width / 2 - contRect.left;
    const cy = avRect.top + avRect.height / 2 - contRect.top;
    return { cx, cy };
  }

  // Disposition du croupier (demi-cercle vers le bas, visible sous l’avatar, 7 cartes max)
  (function layoutDealer() {
    const { cx, cy } = computeCenter(dealerCircle);
    const nodes = Array.from(dealerCircle.querySelectorAll('.card-option'));
    const pos = [];
    nodes.forEach((card, i) => {
      const ang = i * step + dealerRotation;
      const rad = (ang * Math.PI) / 180;
      const x = cx + radiusDealer * Math.cos(rad);
      const y = cy + radiusDealer * Math.sin(rad);
      card.style.left = (x - card.offsetWidth / 2) + 'px';
      card.style.top = (y - card.offsetHeight / 2) + 'px';
      card.style.transform = `rotate(${ang + 90}deg)`;
      pos.push({ node: card, x, y });
    });
    // Garder strictement 7 cartes les plus "bas" (plus grand y)
    pos.sort((a, b) => b.y - a.y);
    pos.forEach((p, idx) => {
      if (idx < visibleCount) {
        p.node.classList.add('visible');
        p.node.classList.remove('hidden');
      } else {
        p.node.classList.add('hidden');
        p.node.classList.remove('visible');
      }
    });
  })();

  // Disposition du joueur (demi-cercle vers le haut, visible au-dessus de l’avatar, 7 cartes max)
  (function layoutPlayer() {
    const { cx, cy } = computeCenter(playerCircle);
    const nodes = Array.from(playerCircle.querySelectorAll('.card-option'));
    const pos = [];
    nodes.forEach((card, i) => {
      const ang = i * step + playerRotation;
      const rad = (ang * Math.PI) / 180;
      const x = cx + radiusPlayer * Math.cos(rad);
      const y = cy + radiusPlayer * Math.sin(rad);
      card.style.left = (x - card.offsetWidth / 2) + 'px';
      card.style.top = (y - card.offsetHeight / 2) + 'px';
      card.style.transform = `rotate(${ang + 90}deg)`;
      pos.push({ node: card, x, y });
    });
    // Garder strictement 7 cartes les plus "haut" (plus petit y)
    pos.sort((a, b) => a.y - b.y);
    pos.forEach((p, idx) => {
      if (idx < visibleCount) {
        p.node.classList.add('visible');
        p.node.classList.remove('hidden');
      } else {
        p.node.classList.add('hidden');
        p.node.classList.remove('visible');
      }
    });
  })();
}

// Recalcul sur resize pour garder le centrage parfait
window.addEventListener('resize', positionCards);

function updatePlayerHandDisplay() {
  playerHandDisplay.innerHTML = '';
  playerHand.forEach(card => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'selected-card-item';
    cardDiv.textContent = card;
    playerHandDisplay.appendChild(cardDiv);
  });

  // Affichage de la valeur
  if (playerHand.length > 0) {
    playerValueDiv.textContent = 'Valeur : ' + getHandValue(playerHand);
  } else {
    playerValueDiv.textContent = '';
  }
}

function updateDealerDisplay() {
  dealerSelected.textContent = dealerCard;
}

// Gestion du scroll/rotation pour le joueur
let playerScrolling = false;
let playerLastX = 0;

playerCircle.addEventListener('mousedown', (e) => {
  if (e.target.classList.contains('card-option') && e.target.classList.contains('visible')) {
    return; // Laisser le clic sur la carte
  }
  playerScrolling = true;
  playerLastX = e.clientX;
  playerCircle.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e) => {
  if (playerScrolling) {
    const deltaX = e.clientX - playerLastX;
    playerRotation -= deltaX * 0.5; // Rotation basée sur le mouvement horizontal
    playerLastX = e.clientX;
    positionCards();
  }
});

document.addEventListener('mouseup', () => {
  if (playerScrolling) {
    playerScrolling = false;
    playerCircle.style.cursor = 'grab';
  }
});

// Gestion du scroll/rotation pour le croupier
let dealerScrolling = false;
let dealerLastX = 0;

dealerCircle.addEventListener('mousedown', (e) => {
  if (e.target.classList.contains('card-option') && e.target.classList.contains('visible')) {
    return; // Laisser le clic sur la carte
  }
  dealerScrolling = true;
  dealerLastX = e.clientX;
  dealerCircle.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e) => {
  if (dealerScrolling) {
    const deltaX = e.clientX - dealerLastX;
    dealerRotation -= deltaX * 0.5; // Rotation basée sur le mouvement horizontal
    dealerLastX = e.clientX;
    positionCards();
  }
});

document.addEventListener('mouseup', () => {
  if (dealerScrolling) {
    dealerScrolling = false;
    dealerCircle.style.cursor = 'grab';
  }
});

// Gestion de la molette de la souris
playerCircle.addEventListener('wheel', (e) => {
  e.preventDefault();
  playerRotation += e.deltaY * 0.2;
  positionCards();
});

dealerCircle.addEventListener('wheel', (e) => {
  e.preventDefault();
  dealerRotation += e.deltaY * 0.2;
  positionCards();
});

// Sélection des cartes du joueur
playerCircle.addEventListener('click', (e) => {
  if (e.target.classList.contains('card-option') && e.target.classList.contains('visible')) {
    if (playerHand.length < 5) { // Limite à 5 cartes max
      const cardValue = e.target.dataset.value;
      playerHand.push(cardValue);
      updatePlayerHandDisplay();

      // Animation de sélection
      e.target.classList.add('selected');
      setTimeout(() => {
        e.target.classList.remove('selected');
      }, 300);
    }
  }
});

// Sélection de la carte du croupier
dealerCircle.addEventListener('click', (e) => {
  if (e.target.classList.contains('card-option') && e.target.classList.contains('visible')) {
    dealerCard = e.target.dataset.value;
    updateDealerDisplay();

    // Animation de sélection
    dealerCircle.querySelectorAll('.card-option').forEach(card => {
      card.classList.remove('selected');
    });
    e.target.classList.add('selected');
  }
});

function showCardPicker(onPick) {
  let picker = document.getElementById('card-picker');
  if (picker) picker.remove();

  picker = document.createElement('div');
  picker.id = 'card-picker';
  picker.className = 'card-picker';
  picker.innerHTML = '<span>Choisissez la carte reçue :</span>';

  allCards.forEach(card => {
    const btn = document.createElement('button');
    btn.className = 'card-btn';
    btn.textContent = card;
    btn.onclick = () => {
      onPick(card);
      picker.remove();
    };
    picker.appendChild(btn);
  });

  actionBlock.parentNode.insertBefore(picker, actionBlock.nextSibling);
}

// Bouton Vérifier
checkBtn.addEventListener('click', async () => {
  if (playerHand.length < 2) {
    actionBlock.textContent = 'Sélectionnez au moins 2 cartes pour le joueur.';
    actionBlock.className = 'action-block warning';
    return;
  }

  actionBlock.textContent = 'Calcul en cours...';
  actionBlock.className = 'action-block waiting';

  try {
    const res = await fetch('http://127.0.0.1:5000/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        player: playerHand,
        dealer: dealerCard
      })
    });
    const data = await res.json();
    actionBlock.textContent = data.action;
    actionBlock.className = 'action-block result';

    // Si l'action est "Tirer", demander la carte reçue
    if (data.action === 'Tirer') {
      showCardPicker((newCard) => {
        playerHand.push(newCard);
        updatePlayerHandDisplay();
        actionBlock.textContent = 'Nouvelle carte ajoutée. Cliquez sur Vérifier.';
        actionBlock.className = 'action-block info';
      });
    }
  } catch (err) {
    actionBlock.textContent = 'Erreur de communication avec le backend.';
    actionBlock.className = 'action-block error';
  }
});

// Bouton Réinitialiser
resetBtn.addEventListener('click', () => {
  playerHand = [];
  updatePlayerHandDisplay();
  actionBlock.textContent = 'Sélectionnez les cartes et cliquez sur Vérifier';
  actionBlock.className = 'action-block';

  // Supprimer le sélecteur de carte s'il existe
  const picker = document.getElementById('card-picker');
  if (picker) picker.remove();

  // Retirer toutes les sélections visuelles
  document.querySelectorAll('.card-option.selected').forEach(card => {
    card.classList.remove('selected');
  });
});

// Support tactile pour les appareils mobiles
playerCircle.addEventListener('touchstart', (e) => {
  if (e.target.classList.contains('card-option') && e.target.classList.contains('visible')) {
    return;
  }
  playerScrolling = true;
  playerLastX = e.touches[0].clientX;
}, { passive: false });

playerCircle.addEventListener('touchmove', (e) => {
  if (playerScrolling) {
    e.preventDefault();
    const deltaX = e.touches[0].clientX - playerLastX;
    playerRotation -= deltaX * 0.5;
    playerLastX = e.touches[0].clientX;
    positionCards();
  }
}, { passive: false });

playerCircle.addEventListener('touchend', () => {
  playerScrolling = false;
});

dealerCircle.addEventListener('touchstart', (e) => {
  if (e.target.classList.contains('card-option') && e.target.classList.contains('visible')) {
    return;
  }
  dealerScrolling = true;
  dealerLastX = e.touches[0].clientX;
}, { passive: false });

dealerCircle.addEventListener('touchmove', (e) => {
  if (dealerScrolling) {
    e.preventDefault();
    const deltaX = e.touches[0].clientX - dealerLastX;
    dealerRotation -= deltaX * 0.5;
    dealerLastX = e.touches[0].clientX;
    positionCards();
  }
}, { passive: false });

dealerCircle.addEventListener('touchend', () => {
  dealerScrolling = false;
});

// Initialisation
positionCards();
updatePlayerHandDisplay();
updateDealerDisplay();
