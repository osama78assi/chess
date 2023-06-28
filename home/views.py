from django.http import JsonResponse
from django.shortcuts import render
import chess


# Home Page
def Index(request):
    data = {
        'title': 'Chess Gameplay'
    }
    return render(request, 'home/index.html', data)



# Page To PLay Chess With AlphaBetaMinMaxL
def AlphaL(request):
    data = {
        'title': 'Game One',
    }
    global boardL
    boardL = chess.Board()
    return render(request, 'home/alphaL.html', data)


# Evaluate The Board And Specify Who Has The Game Till Call
def evaluate_board(board):
    # Count the material balance
    piece_values = {
        chess.PAWN: 1,
        chess.KNIGHT: 3,
        chess.BISHOP: 3,
        chess.ROOK: 5,
        chess.QUEEN: 9,
        chess.KING: 0
    }
    score = 0
    for square, piece in board.piece_map().items():
        value = piece_values[piece.piece_type]
        if piece.color == chess.WHITE:
            score += value
        else:
            score -= value
    # Add bonuses/penalties based on piece positions
    for square, piece in board.piece_map().items():
        if piece.color == chess.WHITE:
            if piece.piece_type == chess.PAWN:
                score += 10 + (7 - chess.square_distance(square, chess.E2))
            elif piece.piece_type == chess.KNIGHT:
                score += 30 + len(board.attacks(square))
            elif piece.piece_type == chess.BISHOP:
                score += 30 + len(board.attacks(square))
            elif piece.piece_type == chess.ROOK:
                score += 50 + len(board.attacks(square))
            elif piece.piece_type == chess.QUEEN:
                score += 90 + len(board.attacks(square))
            elif piece.piece_type == chess.KING:
                score += 900 + len(board.attacks(square))
        else:
            if piece.piece_type == chess.PAWN:
                score -= 10 + (chess.square_distance(square, chess.E7))
            elif piece.piece_type == chess.KNIGHT:
                score -= 30 + len(board.attacks(square))
            elif piece.piece_type == chess.BISHOP:
                score -= 30 + len(board.attacks(square))
            elif piece.piece_type == chess.ROOK:
                score -= 50 + len(board.attacks(square))
            elif piece.piece_type == chess.QUEEN:
                score -= 90 + len(board.attacks(square))
            elif piece.piece_type == chess.KING:
                score -= 900 + len(board.attacks(square))
    return score


# AlphaL Algorithm 
def alphaBetaMinMaxL(board, l, alpha, beta, maximizing_player = True):
    if l == 0 or board.is_game_over():
        return evaluate_board(board)
    best_score = float('-inf') if maximizing_player else float('inf')
    for move in list(board.legal_moves):
        board.push(move)
        score = alphaBetaMinMaxL(board, l - 1, alpha, beta, not maximizing_player)
        board.pop()
        if maximizing_player:
            if score > best_score:
                best_score = score
                alpha = max(alpha, best_score)
                if beta <= alpha: 
                    break
        else:
            if score < best_score:
                best_score = score
                beta = min(beta, best_score)
                if beta <= alpha:
                    break
    return best_score


# To Know If Theres A Check In AlphaBetaMinMaxL
def IsCheckL(request):
    return JsonResponse({'check': boardL.is_check()})


# To Get Legal Moves When The User Click On The Piece
def GetLegalL(request):
    legal = list(boardL.legal_moves)
    stringLegalMoves = list(map(lambda x: str(x), legal))
    if boardL.is_game_over():
        return JsonResponse({'gameOver': boardL.is_game_over(), 'result': boardL.result()})
    else:
        return JsonResponse({'legalMoves': stringLegalMoves, 'gameOver': boardL.is_game_over()})


# To Make Bot Move 
def BotTurnL(request):
    boardL.turn = chess.BLACK # Switch The Turn
    if not boardL.is_game_over():
        L = 2  # Initial depth
        alpha = float('-inf')  # Initial alpha value
        beta = float('inf')  # Initial beta value
        legalMoves = list(boardL.legal_moves)
        best_move = None
        best_score = float('+inf')
        for move2 in legalMoves:
            boardL.push(move2)
            score = alphaBetaMinMaxL(boardL, L, alpha, beta, True)
            boardL.pop()
            if score < best_score:
                best_move = move2
                best_score = score
        boardL.push(best_move) # Push Bot Move
        botMove = best_move
        boardL.turn = chess.WHITE # Switch The Turn
        return JsonResponse({'botMove': str(botMove), 'gameOver': boardL.is_game_over(), 'result': boardL.result()})
    return JsonResponse({'gameOver': boardL.is_game_over(), 'result': boardL.result()})


# To Get The Move From User
def UserTurnL(request):
    user = request.GET.get('move')
    if not boardL.is_game_over():
        boardL.turn = chess.WHITE
        legalMoves = list(boardL.legal_moves)
        stringLegalMoves = list(map(lambda x: str(x), legalMoves))
        for i in range(len(legalMoves)):
            if user == stringLegalMoves[i]:
                boardL.push(legalMoves[i]) # To Push The Move As USI Not String
        boardL.turn = chess.BLACK # Switch The Turn
    return JsonResponse({"connection": True})


# AlphBest Algorithm
def alphaBetaMinMaxBest(board, l, alpha, beta, k, maximizing_player=True):
    if l == 0 or board.is_game_over():
        return evaluate_board(board)

    moves_scores = []
    for move in board.legal_moves:
        board.push(move)
        score = alphaBetaMinMaxBest(board, l - 1, alpha, beta, k, not maximizing_player)
        board.pop()
        moves_scores.append((score, move))

    moves_scores.sort(key= lambda a: a[0], reverse= maximizing_player)
    top_moves = moves_scores[:k]
    best_score = float('-inf') if maximizing_player else float('inf')
    for score, move in top_moves:
        if maximizing_player:
            best_score = max(best_score, score)
            alpha = max(alpha, best_score)
            if beta <= alpha:
                break
        else:
            best_score = min(best_score, score)
            beta = min(beta, best_score)
            if beta <= alpha:
                break

    return best_score


# Page To Play With AlphaBetaMinMaxBest
def AlphBest(request):
    data = {
        'title': 'Game Two',
    }
    global boardB
    boardB = chess.Board()
    return render(request, 'home/alphaBest.html', data)


# To Know If Theres A Check In AlphaBetaMinMaxBest
def IsCheckB(request):
    return JsonResponse({'check': boardB.is_check()})


# To Get Legal Moves When The User Click On The Piece
def GetLegalB(request):
    legal = list(boardB.legal_moves)
    stringLegalMoves = list(map(lambda x: str(x), legal))
    if boardB.is_game_over():
        return JsonResponse({'gameOver': boardB.is_game_over(), 'result': boardB.result()})
    else:
        return JsonResponse({'legalMoves': stringLegalMoves, 'gameOver': boardB.is_game_over(), 'result': boardB.result()})


# To Make Bot Move 
def BotTurnB(request):
    boardB.turn = chess.BLACK # Switch The Turn
    if not boardB.is_game_over():
        L = 2  # Initial depth
        k = 5
        alpha = float('-inf')  # Initial alpha value
        beta = float('inf')  # Initial beta value
        legalMoves = list(boardB.legal_moves)
        best_move = None
        best_score = float('+inf')
        for move in legalMoves:
            boardB.push(move)
            score = alphaBetaMinMaxBest(boardB, L, alpha, beta, k, False)
            boardB.pop()
            if score < best_score:
                best_move = move
                best_score = score
        boardB.push(best_move) # Push Bot Move
        botMove = best_move
        boardB.turn = chess.WHITE # Switch The Turn
        return JsonResponse({'botMove': str(botMove), 'gameOver': boardB.is_game_over(), 'result': boardB.result()})
    return JsonResponse({'gameOver': boardB.is_game_over(), 'result': boardB.result()})


# To Get The Move From User
def UserTurnB(request):
    user = request.GET.get('move')
    if not boardB.is_game_over():
        boardB.turn = chess.WHITE
        legalMoves = list(boardB.legal_moves)
        stringLegalMoves = list(map(lambda x: str(x), legalMoves))
        for i in range(len(legalMoves)):
            if user == stringLegalMoves[i]:
                boardB.push(legalMoves[i]) # To Push The Move As UCI Not String
        boardB.turn = chess.BLACK # Switch The Turn
    return JsonResponse({"connection": True})
