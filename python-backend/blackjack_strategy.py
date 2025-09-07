"""
Module de stratégie de base du Blackjack (S17 : le croupier reste sur soft 17)
"""

def get_card_value(card):
    """Retourne la valeur numérique d'une carte pour le calcul du total."""
    if card in ["J", "Q", "K", "10"]:
        return 10
    elif card == "A":
        return 11
    else:
        return int(card)

def is_pair(cards):
    """Vérifie si la main est une paire."""
    return len(cards) == 2 and cards[0] == cards[1]

def is_soft_hand(cards):
    """Vérifie si la main est souple (contient un As compté comme 11)."""
    if "A" not in cards:
        return False
    total = sum(get_card_value(c) for c in cards)
    return total <= 21

def hand_total(cards):
    """Calcule le total de la main en tenant compte de l'As."""
    total = sum(get_card_value(c) for c in cards)
    aces = cards.count("A")
    while total > 21 and aces:
        total -= 10
        aces -= 1
    return total

def get_action(player_cards, dealer_card):
    """
    Retourne l'action optimale selon la stratégie de base S17.
    Actions possibles : "Tirer", "Rester", "Doubler", "Séparer"
    """
    dealer_val = get_card_value(dealer_card)
    total = hand_total(player_cards)
    # Gestion des paires
    if is_pair(player_cards):
        pair_card = player_cards[0]
        pair_strategy = {
            "A": "Séparer",
            "8": "Séparer",
            "10": "Rester",
            "9": "Séparer" if dealer_val not in [7, 10, 11] else "Rester",
            "7": "Séparer" if dealer_val <= 7 else "Tirer",
            "6": "Séparer" if dealer_val <= 6 else "Tirer",
            "5": "Doubler" if dealer_val in range(2, 10) else "Tirer",
            "4": "Séparer" if dealer_val in [5, 6] else "Tirer",
            "3": "Séparer" if dealer_val <= 7 else "Tirer",
            "2": "Séparer" if dealer_val <= 7 else "Tirer",
        }
        return pair_strategy.get(pair_card, "Tirer")
    # Gestion des mains souples
    if is_soft_hand(player_cards):
        if len(player_cards) == 2:
            soft_total = hand_total(player_cards)
            if soft_total == 20 or soft_total == 19:
                return "Rester"
            if soft_total == 18:
                if dealer_val in [2, 7, 8]:
                    return "Rester"
                elif dealer_val in [3, 4, 5, 6]:
                    return "Doubler"
                else:
                    return "Tirer"
            if soft_total == 17:
                if dealer_val in [3, 4, 5, 6]:
                    return "Doubler"
                else:
                    return "Tirer"
            if soft_total in [15, 16]:
                if dealer_val in [4, 5, 6]:
                    return "Doubler"
                else:
                    return "Tirer"
            if soft_total in [13, 14]:
                if dealer_val in [5, 6]:
                    return "Doubler"
                else:
                    return "Tirer"
        # Plus de deux cartes : pas de double
        if hand_total(player_cards) >= 18:
            return "Rester"
        else:
            return "Tirer"
    # Gestion des mains dures
    if total >= 17:
        return "Rester"
    if total >= 13 and total <= 16:
        if dealer_val <= 6:
            return "Rester"
        else:
            return "Tirer"
    if total == 12:
        if dealer_val in [4, 5, 6]:
            return "Rester"
        else:
            return "Tirer"
    if total == 11:
        if len(player_cards) == 2:
            return "Doubler"
        else:
            return "Tirer"
    if total == 10:
        if dealer_val <= 9 and len(player_cards) == 2:
            return "Doubler"
        else:
            return "Tirer"
    if total == 9:
        if dealer_val in [3, 4, 5, 6] and len(player_cards) == 2:
            return "Doubler"
        else:
            return "Tirer"
    return "Tirer"

if __name__ == "__main__":
    print("Bienvenue dans le coach de stratégie Blackjack !")
    main_joueur = input("Entrez vos cartes (séparées par une virgule, ex: 'A,8'): ")
    carte_croupier = input("Entrez la carte visible du croupier (ex: 'K'): ")
    cartes_joueur = [c.strip() for c in main_joueur.split(",")]
    carte_croupier = carte_croupier.strip()
    action = get_action(cartes_joueur, carte_croupier)
    print(f"Action recommandée : {action}")
