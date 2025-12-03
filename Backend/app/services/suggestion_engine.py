def score_move(piece, new_position, game_state):
    score = 0

    # 1. Mover es siempre mejor que no mover
    score += 10

    # 2. ¿Comería a alguien?
    if new_position in game_state.opponent_positions:
        score += 50

    # 3. ¿Evita que te coman? (Salir de casilla peligrosa)
    if not piece.is_safe and piece.position in game_state.opponent_positions:
        score += 20

    # 4. ¿Entraría a una casilla segura?
    SAFE_POSITIONS = [5, 12, 19, 26, 33, 40, 47, 54]
    if new_position in SAFE_POSITIONS:
        score += 15

    # 5. ¿Entra a casa?
    HOME_POSITION = 68
    if new_position >= HOME_POSITION:
        score += 100

    return score


def generate_suggestions(game_state):
    suggestions = []

    for piece in game_state.pieces:
        if not piece.can_move:
            continue

        new_position = piece.position + game_state.dice
        move_score = score_move(piece, new_position, game_state)

        suggestions.append({
            "piece_id": piece.id,
            "from": piece.position,
            "to": new_position,
            "score": move_score
        })

    # Ordenar de mejor a peor
    suggestions.sort(key=lambda x: x["score"], reverse=True)

    return {
        "best_move": suggestions[0] if suggestions else None,
        "all_moves": suggestions
    }
