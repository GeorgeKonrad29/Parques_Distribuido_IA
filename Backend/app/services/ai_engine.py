def evaluate_move(piece, dice, enemies):
    score = 0
    new_position = piece.position + dice

    # Regla 1: sacar ficha
    if piece.position == -1 and dice == 5:
        score += 10

    # Regla 2: capturar
    for enemy in enemies:
        if enemy.position == new_position:
            score += 15

    # Regla 3: evitar peligro
    for enemy in enemies:
        if enemy.position in range(new_position - 6, new_position):
            score -= 10  # enemigo cerca

    # Regla 4: avanzar hacia seguro
    if new_position in [5, 12, 17, 22, 29, 34, 39, 44, 51, 56]:
        score += 6

    # Regla 5: entrar a meta
    if new_position >= 68:
        score += 20

    return score, new_position


def generate_suggestions(game_state):
    dice = game_state.dice
    suggestions = []

    for piece in game_state.pieces:
        if piece.position == -1 and dice != 5:
            continue  # no puede salir

        score, new_pos = evaluate_move(piece, dice, game_state.enemies)

        suggestions.append({
            "piece_id": piece.id,
            "from": piece.position,
            "to": new_pos,
            "score": score,
            "reason": explain(score)
        })

    # ordenar por puntuación
    suggestions.sort(key=lambda x: x["score"], reverse=True)
    return suggestions


def explain(score):
    if score >= 15:
        return "Excelente jugada: captura o avanza mucho."
    if score >= 10:
        return "Buena jugada: avanzar seguro o sacar ficha."
    if score >= 5:
        return "Jugada normal, no hay riesgo."
    return "Riesgosa: puedes quedar expuesto."
