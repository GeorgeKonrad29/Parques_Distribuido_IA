def can_leave_home(piece: dict, dice: int):
    return piece["position"] == -1 and dice == 5

def can_move(piece: dict, dice: int):
    return piece["position"] >= 0
