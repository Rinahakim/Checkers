let idForNewBoard = 0;
let boardModelInit = CreateBoardModel();
let theFirstBoardModel = CreateBoardModel();
let boardsModel = [];
boardsModel.push(theFirstBoardModel);
let visualBoard = CreateVisualBoard();
AddButtons();

let statusGame = [];
let gameState = {
    IsWhiteTurn: true,
    isChaining: false,
    promotedAndNeedToChain: false
};
statusGame.push(gameState);

const visualBoards = document.querySelectorAll('.game-container');
for(visualBoard of visualBoards)
{
    const theCurrentBoardModel = boardsModel[parseInt(visualBoard.id,10)];
    HandleButtonsDrawResignReloadAddGameOnClick();
    AddPieceEventListenersAndChecingWin(theCurrentBoardModel, visualBoard);
}

function CreateBoardModel()
{
    const boardModel = []; 
    let pieceId = 0;

    for (let row = 0; row < 8; row++) 
    {
        const rowArray = []; 

        for (let col = 0; col < 8; col++) 
        {
            let piece = null;
            if(row < 3)
            {
                if ((row + col) % 2 !== 0) 
                { 
                    piece = { color: 'red', isKing: false, isSelected: false};
                }
            }
            else if(row >= 5)
            {
                if ((row + col) % 2 !== 0) 
                { 
                    piece = { color: 'white', isKing: false, isSelected: false}; 
                }
            }
            rowArray.push({ color: (row + col) % 2 === 0 ? 'white' : 'black', piece , id: pieceId});
            pieceId++;
        }
        boardModel.push(rowArray); 
    }

    console.log(boardModel);
    return boardModel;
}

function CreateVisualBoard()
{
    const gameContainer = document.createElement('div');
    gameContainer.classList.add('game-container');
    gameContainer.id = idForNewBoard;
    idForNewBoard++;
    const board = document.createElement('div');
    board.id = 'board';
    board.classList.add('board');
    const button_box = document.createElement('div');
    button_box.id = 'button_box';
    const message = document.createElement('div');
    message.id = 'message';
    let pieceId = 0;

    for (let i = 0; i < boardModelInit.length; i++) { 
        for (let j = 0; j < boardModelInit[i].length; j++) { 
            const slod = boardModelInit[i][j];

            const box = document.createElement('div');
            box.classList.add(slod.color);
            box.id = pieceId;

            if (slod.piece) 
            {
                const piece = document.createElement('div');
                piece.classList.add('piece', `${slod.piece.color}-piece`);
                if(slod.piece.isKing)
                {
                    piece.classList.add('king');
                }
                if(slod.piece.isSelected)
                {
                    box.classList.add('selected');
                }
                box.appendChild(piece);
            }

            board.appendChild(box);
            pieceId++;
        }
    }
    board.appendChild(button_box);
    gameContainer.appendChild(board);
    gameContainer.appendChild(button_box);
    gameContainer.appendChild(message);
    document.body.appendChild(gameContainer);
}
function UpdateVisualBoard(boardModel, visualBoard) {
    let pieceId = 0;
    const board = visualBoard.children[0];
    board.innerHTML = '';

    for (let i = 0; i < boardModel.length; i++) { 
        for (let j = 0; j < boardModel[i].length; j++) { 
            const slod = boardModel[i][j];

            const box = document.createElement('div');
            box.classList.add(slod.color);
            box.id = pieceId;

            if (slod.piece) {
                const piece = document.createElement('div');
                piece.classList.add('piece', `${slod.piece.color}-piece`);
                if(slod.piece.isKing)
                {
                    piece.classList.add('king');
                }
                if(slod.piece.isSelected)
                {
                    box.classList.add('selected');
                }
                box.appendChild(piece);
            }

            board.appendChild(box);
            pieceId++;
        }
    }
    return visualBoard;
}

function AddButtons()
{
    const buttonBoxs = document.querySelectorAll('#button_box');
    const lastButtonBox = buttonBoxs[buttonBoxs.length - 1];

    lastButtonBox.classList.add('button_box');
    const draw_button = document.createElement('button');
    draw_button.id = 'draw_button';
    draw_button.classList.add('buttons');
    lastButtonBox.appendChild(draw_button);
    draw_button.textContent = 'Draw';

    const resign_button = document.createElement('button');
    resign_button.id = 'resign_button';
    resign_button.classList.add('buttons');
    resign_button.textContent = 'Resign'; 
    lastButtonBox.appendChild(resign_button);

    const reload_button = document.createElement('button');
    reload_button.id = 'reload_button';
    reload_button.classList.add('buttons');
    reload_button.textContent = 'Reload'; 
    lastButtonBox.appendChild(reload_button);

}

function AddPieceEventListenersAndChecingWin(boardModel, visualBoard,disableOthers = false, selectedSlot = null)
{  
    const board = visualBoard.children[0];
    if(IsWin(boardModel, visualBoard))
    {
        return;
    }

    if (disableOthers && selectedSlot) 
    {
        const allPieces = board.querySelectorAll('.white-piece, .red-piece');
        allPieces.forEach(piece => {
            piece.onclick = null;
        });
            const selectedSlodInVisualBoard = board.children[selectedSlot.id];
            const selectedPieceInVisualBoard = selectedSlodInVisualBoard.children[0];
            selectedPieceInVisualBoard.addEventListener('click', (event) => {
            event.stopPropagation();
            board.querySelectorAll('.selected').forEach(slot => {
                slot.classList.remove('selected');
            });
            FindAllSelectedPiecesAndRemoveTheSelect(boardModel);
            selectedSlodInVisualBoard.classList.add('selected');
            selectedSlot.piece.isSelected = true;
            AddSlotEventListeners(boardModel, visualBoard);
        });

        return;
    }
    let selectedPieceInBoardModel = null;
    const white_piece_list = board.querySelectorAll('.white-piece');
    for(let white_piece of white_piece_list)
    {
        white_piece.addEventListener('click', (event) => {
            if (statusGame[parseInt(visualBoard.id, 10)].IsWhiteTurn) {
                event.stopPropagation();
                board.querySelectorAll('.selected').forEach(slot => {
                    slot.classList.remove('selected');
                });
                FindAllSelectedPiecesAndRemoveTheSelect(boardModel);
                white_piece.parentElement.classList.add('selected');
                selectedPieceInBoardModel = FindElement(boardModel, parseInt(white_piece.parentElement.id, 10));
                selectedPieceInBoardModel.piece.isSelected = true;
                AddSlotEventListeners(boardModel, visualBoard);
            }
        });
    } 
    
    const red_piece_list = board.querySelectorAll('.red-piece');
    for(let red_piece of red_piece_list)
    {
        red_piece.addEventListener('click', (event) => {
            if (!statusGame[parseInt(visualBoard.id, 10)].IsWhiteTurn) {
                event.stopPropagation();
                board.querySelectorAll('.selected').forEach(slot => {
                    slot.classList.remove('selected');
                });
                FindAllSelectedPiecesAndRemoveTheSelect(boardModel);
    
                red_piece.parentElement.classList.add('selected');
                selectedPieceInBoardModel = FindElement(boardModel, parseInt(red_piece.parentElement.id, 10));
                selectedPieceInBoardModel.piece.isSelected = true;
                AddSlotEventListeners(boardModel, visualBoard);
            }
        });
    } 
}
function AddSlotEventListeners(boardModel, visualBoard)
{
    const blackSlotList = visualBoard.querySelectorAll('.black');
    for(let blackSlot of blackSlotList)
    {
        blackSlot.addEventListener('click', (event) => {
            event.stopPropagation();
            const selectedSlotInBoardModel = FindSelectedPiece(boardModel);
            let selectedPiece = null;
            if(selectedSlotInBoardModel !== null)
            {
                selectedPiece = selectedSlotInBoardModel.piece;
            }
            
            const blackSlotInBoardModel = FindElement(boardModel, parseInt(blackSlot.id, 10));
            if(selectedSlotInBoardModel !== null && selectedPiece !== null)
            {
                if (statusGame[parseInt(visualBoard.id, 10)].isChaining) 
                {
                    if (selectedPiece.isKing && CheckIfKingCanEat(boardModel, selectedSlotInBoardModel, blackSlotInBoardModel)) 
                    {
                        const toEatSlot = CheckIfKingCanEat(boardModel, selectedSlotInBoardModel, blackSlotInBoardModel);
                        DoEatForKing(boardModel, selectedSlotInBoardModel, blackSlotInBoardModel, toEatSlot);
                        if(continueChainForTheKing(boardModel, blackSlotInBoardModel))
                        {
                            blackSlotInBoardModel.piece.isSelected = true;
                            UpdateVisualBoard(boardModel, visualBoard);
                            AddPieceEventListenersAndChecingWin(boardModel, visualBoard, true, blackSlotInBoardModel);
                        }
                        else
                        {
                            UpdateVisualBoard(boardModel, visualBoard);
                            statusGame[parseInt(visualBoard.id , 10)].IsWhiteTurn = !statusGame[parseInt(visualBoard.id, 10)].IsWhiteTurn;
                            statusGame[parseInt(visualBoard.id, 10)].isChaining = false;
                            AddPieceEventListenersAndChecingWin(boardModel, visualBoard);
                        }
                    } 
                    else if (!selectedPiece.isKing && CheckIfCanEat(boardModel, selectedSlotInBoardModel, blackSlotInBoardModel)) 
                    {
                        DoEat(boardModel, selectedSlotInBoardModel, blackSlotInBoardModel);
                        if(continueChain(boardModel, blackSlotInBoardModel))
                        {
                            blackSlotInBoardModel.piece.isSelected = true;
                            UpdateVisualBoard(boardModel, visualBoard);
                            AddPieceEventListenersAndChecingWin(boardModel, visualBoard, true, blackSlotInBoardModel);
                        }
                        else
                        {
                            UpdateVisualBoard(boardModel, visualBoard);
                            statusGame[parseInt(visualBoard.id, 10)].IsWhiteTurn = !statusGame[parseInt(visualBoard.id, 10)].IsWhiteTurn;
                            statusGame[parseInt(visualBoard.id, 10)].isChaining = false;
                            AddPieceEventListenersAndChecingWin(boardModel, visualBoard);
                        }
                    }
                    else 
                    {
                        return;
                    }
                } 
                else 
                {
                    if(selectedPiece.isKing && CheckIfKingCanEat(boardModel, selectedSlotInBoardModel, blackSlotInBoardModel) !== null) 
                    {
                        const toEatSlot = CheckIfKingCanEat(boardModel, selectedSlotInBoardModel, blackSlotInBoardModel);
                        DoEatForKing(boardModel, selectedSlotInBoardModel, blackSlotInBoardModel, toEatSlot);
                        if(continueChainForTheKing(boardModel, blackSlotInBoardModel))
                        {
                            statusGame[parseInt(visualBoard.id, 10)].isChaining = true;
                            blackSlotInBoardModel.piece.isSelected = true;
                            UpdateVisualBoard(boardModel, visualBoard);
                            AddPieceEventListenersAndChecingWin(boardModel, visualBoard, true, blackSlotInBoardModel);
                        }
                        else
                        {
                            UpdateVisualBoard(boardModel, visualBoard);
                            statusGame[parseInt(visualBoard.id, 10)].IsWhiteTurn = !statusGame[parseInt(visualBoard.id, 10)].IsWhiteTurn;
                            statusGame[parseInt(visualBoard.id, 10)].isChaining = false;
                            AddPieceEventListenersAndChecingWin(boardModel, visualBoard);
                        }
                    }
                    else if(selectedPiece.isKing && IsKingValidMove(boardModel, selectedSlotInBoardModel, blackSlotInBoardModel)) 
                    {
                        MovePiece(boardModel, visualBoard, selectedSlotInBoardModel, blackSlotInBoardModel);
                        UpdateVisualBoard(boardModel, visualBoard);
                        statusGame[parseInt(visualBoard.id, 10)].IsWhiteTurn = !statusGame[parseInt(visualBoard.id, 10)].IsWhiteTurn;
                        statusGame[parseInt(visualBoard.id, 10)].isChaining = false;
                        AddPieceEventListenersAndChecingWin(boardModel, visualBoard);
                    }
                    else if (selectedPiece && CheckIfCanEat(boardModel, selectedSlotInBoardModel, blackSlotInBoardModel)) 
                    {
                        DoEat(boardModel, selectedSlotInBoardModel, blackSlotInBoardModel);
                        if(continueChain(boardModel, blackSlotInBoardModel))
                        {
                            statusGame[parseInt(visualBoard.id, 10)].isChaining = true;
                            blackSlotInBoardModel.piece.isSelected = true;
                            UpdateVisualBoard(boardModel, visualBoard);
                            AddPieceEventListenersAndChecingWin(boardModel, visualBoard,true, blackSlotInBoardModel);
                        }
                        else if(statusGame[parseInt(visualBoard.id, 10)].promotedAndNeedToChain && continueChainForTheKing(boardModel, blackSlotInBoardModel))
                        {
                            statusGame[parseInt(visualBoard.id, 10)].promotedAndNeedToChain = false;
                            statusGame[parseInt(visualBoard.id, 10)].isChaining = true;
                            blackSlotInBoardModel.piece.isSelected = true;
                            UpdateVisualBoard(boardModel, visualBoard);
                            AddPieceEventListenersAndChecingWin(boardModel, visualBoard,true, blackSlotInBoardModel);   
                        }
                        else
                        {
                            UpdateVisualBoard(boardModel, visualBoard);
                            statusGame[parseInt(visualBoard.id, 10)].IsWhiteTurn = !statusGame[parseInt(visualBoard.id, 10)].IsWhiteTurn;
                            statusGame[parseInt(visualBoard.id, 10)].isChaining = false;
                            AddPieceEventListenersAndChecingWin(boardModel, visualBoard);
                        }
                    }
                    else if (selectedPiece && IsValidMove(selectedSlotInBoardModel, blackSlotInBoardModel)) 
                    {
                        MovePiece(boardModel, visualBoard, selectedSlotInBoardModel, blackSlotInBoardModel);
                        UpdateVisualBoard(boardModel, visualBoard);
                        statusGame[parseInt(visualBoard.id, 10)].IsWhiteTurn = !statusGame[parseInt(visualBoard.id, 10)].IsWhiteTurn;
                        statusGame[parseInt(visualBoard.id, 10)].isChaining = false;
                        AddPieceEventListenersAndChecingWin(boardModel, visualBoard);
                    }
                }
            }
        });
    }
}

function HandleButtonsDrawResignReloadAddGameOnClick()
{  
    const gameBoards = document.querySelectorAll('.game-container');
    for(let gameBoard of gameBoards)
    {
        const drawButton = gameBoard.querySelector('#draw_button');
        const resignButton = gameBoard.querySelector('#resign_button');
        const reloadButton = gameBoard.querySelector('#reload_button');
        const buttonNo = gameBoard.querySelector('#buttonNo');
        const buttonYes = gameBoard.querySelector('#buttonYes');
        const buttonOk = gameBoard.querySelector('#buttonOk');
        const backgroundModal = gameBoard.querySelector('.modal-background');

        if(drawButton && !drawButton.hasAttribute('data-listener'))
        {
            drawButton.addEventListener('click', () => {
                const modal_background = document.createElement('div');
                modal_background.classList.add('modal-background');
                gameBoard.appendChild(modal_background);

                const modal = document.createElement('div');
                modal.classList.add('modal');
                modal.id = 'modal'; 
                modal_background.appendChild(modal);
                modal.textContent = 'Would you like to end in a draw?'
        
                const button_yes = document.createElement('button');
                const button_no = document.createElement('button');
        
                button_yes.textContent = 'Yes';
                button_no.textContent = 'No';
                button_no.id = 'buttonNo';
                button_yes.id = 'buttonYes';
        
                modal.appendChild(button_yes);
                modal.appendChild(button_no);

                const buttonNo = gameBoard.querySelector('#buttonNo');
                const buttonYes = gameBoard.querySelector('#buttonYes');
                if(buttonNo && !buttonNo.hasAttribute('data-listener'))
                {
                    buttonNo.addEventListener('click', () => {
                        modal_background.remove();
                    });
                    buttonNo.setAttribute('data-listener', 'true');
                }
                
                if(buttonYes && !buttonYes.hasAttribute('data-listener'))
                {
                    buttonYes.addEventListener('click', () => {
                        modal_background.children[0].remove();
                        const modal = document.createElement('div');
                        modal.classList.add('modal');
                        modal.textContent = 'Draw end Game!';
                        modal_background.appendChild(modal);
                        const buttonOk = document.createElement('button');
                        buttonOk.id = 'buttonOk';
                        buttonOk.textContent = 'Ok';
                        modal.appendChild(buttonOk);
                        const button_ok = gameBoard.querySelector('#buttonOk');
                        if(button_ok && !button_ok.hasAttribute('data-listener'))
                        {
                            button_ok.addEventListener('click', () => {
                                modal.remove();
                            });
                            button_ok.setAttribute('data-listener', 'true');
                        }
                    });
                    buttonYes.setAttribute('data-listener', 'true');
                }
            });
            drawButton.setAttribute('data-listener', 'true');
        }
        if(resignButton && !resignButton.hasAttribute('data-listener'))
        {
            resignButton.addEventListener('click', () => {
                const modal_background = document.createElement('div');
                modal_background.classList.add('modal-background');
                gameBoard.appendChild(modal_background);
                const modal = document.createElement('div');
                modal.classList.add('modal');
                modal_background.appendChild(modal);
                modal.textContent = (statusGame[parseInt(visualBoard.id, 10)].IsWhiteTurn) ? "Red Win!!!": "White Win";

                const buttonOkForResign = document.createElement('button');
                buttonOkForResign.id = 'buttonOkResign';
                buttonOkForResign.textContent = 'Ok';
                modal.appendChild(buttonOkForResign);

                const buttonOkResign = gameBoard.querySelector('#buttonOkResign');
                if(buttonOkResign && !buttonOkResign.hasAttribute('data-listener'))
                {
                    buttonOkResign.addEventListener('click', () => {
                        modal.remove();
                    });
                    buttonOkResign.setAttribute('data-listener', 'true');
                }
            });
            resignButton.setAttribute('data-listener', 'true');
        }
        if(reloadButton && !reloadButton.hasAttribute('data-listener'))
        {
            reloadButton.addEventListener('click', () => {
                const idxOfBoardModelInArr = parseInt(gameBoard.id, 10);
                const newboardModel = CreateBoardModel();
                boardsModel[idxOfBoardModelInArr] = newboardModel;
                const visualBoardId = (idxOfBoardModelInArr).toString();
                const visualBoard = document.querySelector(`[id="${visualBoardId}"].game-container`); 
                UpdateVisualBoard(newboardModel, visualBoard);
                statusGame[idxOfBoardModelInArr].IsWhiteTurn = true;
                statusGame[idxOfBoardModelInArr].isChaining = false;
                statusGame[idxOfBoardModelInArr].promotedAndNeedToChain = false;
                HandleButtonsDrawResignReloadAddGameOnClick();
                AddPieceEventListenersAndChecingWin(boardsModel[idxOfBoardModelInArr], visualBoard);
            });
            reloadButton.setAttribute('data-listener', 'true');
        }
    }
    const addGameButton = document.querySelector('#add_game'); 
    if(addGameButton && !addGameButton.hasAttribute('data-listener'))
    {
        addGameButton.addEventListener('click', () => {
            const newBoard = CreateBoardModel();
            boardsModel.push(newBoard);
            CreateVisualBoard();
            AddButtons();
            let gameState = {
                IsWhiteTurn: true,
                isChaining: false,
                promotedAndNeedToChain: false
            };
            statusGame.push(gameState);
            const visualBoards = document.querySelectorAll('.game-container');
            for(visualBoard of visualBoards)
            {
                const theCurrentBoardModel = boardsModel[parseInt(visualBoard.id,10)];
                HandleButtonsDrawResignReloadAddGameOnClick();
                AddPieceEventListenersAndChecingWin(theCurrentBoardModel, visualBoard);
            }
        });
        addGameButton.setAttribute('data-listener', 'true');
    }
}

function FindRedPieces(boardModel, isToFindRedKings) 
{
    const redPieces = [];
    if(isToFindRedKings)
    {
        for(let i = 0 ; i < 8 ; i++)
        {
            for(let j = 0 ; j < 8 ; j++)
            {
                if (boardModel[i][j].piece !== null && boardModel[i][j].piece.color === 'red' && boardModel[i][j].piece.isKing === true) 
                {
                    redPieces.push(boardModel[i][j]);
                }
            }
        }
        return redPieces;
    }

    for(let i = 0 ; i < 8 ; i++)
    {
        for(let j = 0 ; j < 8 ; j++)
        {
            if (boardModel[i][j].piece !== null && boardModel[i][j].piece.color === 'red') 
            {
                redPieces.push(boardModel[i][j]);
            }
        }
    }
    return redPieces;
}

function FindWhitePieces(boardModel, isToFindWhiteKings) 
{
    const whitePieces = [];
    if(isToFindWhiteKings)
    {
        for(let i = 0 ; i < 8 ; i++)
        {
            for(let j = 0 ; j < 8 ; j++)
            {
                if (boardModel[i][j].piece !== null && boardModel[i][j].piece.color === 'white' && boardModel[i][j].piece.isKing === true) 
                {
                    whitePieces.push(boardModel[i][j]);
                }
            }
        }
        return whitePieces;
    }

    for(let i = 0 ; i < 8 ; i++)
    {
        for(let j = 0 ; j < 8 ; j++)
        {
            if (boardModel[i][j].piece !== null && boardModel[i][j].piece.color === 'white') 
            {
                whitePieces.push(boardModel[i][j]);
            }
        }
    }
    return whitePieces;
}

function FindElement(boardModel, elementId)
{
    for(let i = 0 ; i < 8; i++)
    {
        for(let j = 0; j < 8 ; j++)
        {
            if(boardModel[i][j].id === elementId)
            {
                return boardModel[i][j];
            }
        }
    }
    return null;
}
function FindSelectedPiece(boardModel) 
{
    for(let i = 0 ; i < 8 ; i++)
    {
        for(let j = 0 ; j < 8 ; j++)
        {
            if (boardModel[i][j].piece !== null && boardModel[i][j].piece.isSelected === true) 
            {
                return boardModel[i][j];
            }
        }
    }
    return null;
}
function FindAllSelectedPiecesAndRemoveTheSelect(boardModel)
{
    for(let i = 0 ; i < 8 ; i++)
    {
        for(let j = 0 ; j < 8 ; j++)
        {
            if (boardModel[i][j].piece !== null && boardModel[i][j].piece.isSelected === true) 
            {
                boardModel[i][j].piece.isSelected = false;
            }
        }
    }
}

function IsWin(boardModel, visualBoard)  
{

    const OpponentPiece = statusGame[parseInt(visualBoard.id, 10)].IsWhiteTurn ? FindRedPieces(boardModel, false) : FindWhitePieces(boardModel, false);
    if(OpponentPiece.length === 0) //if no OpponentPiece
    {
        PrintTheWinner((statusGame[parseInt(visualBoard.id, 10)].IsWhiteTurn) ? "White Win!!!": "Red Win", visualBoard);
        return true;
    }

    const pieces = statusGame[parseInt(visualBoard.id, 10)].IsWhiteTurn ?  FindWhitePieces(boardModel, false) : FindRedPieces(boardModel, false);
    for(let piece of pieces)
    {
        for(let i = 0 ; i < 8 ; i++)
        {
            for(let j = 0 ; j < 8; j++)
            {
                const targetSlotId = i * 8 + j;
                const targetSlot = FindElement(boardModel, targetSlotId);        
                const currentSlot = piece;            

                if(targetSlot !== null && targetSlot.color === "black" && piece.piece.isKing && (CheckIfKingCanEat(boardModel, currentSlot, targetSlot) ||
                  IsKingValidMove(boardModel, currentSlot, targetSlot)))
                {
                    return false;
                }
                else if(targetSlot !== null && targetSlot.color === "black" && (CheckIfCanEat(boardModel, currentSlot, targetSlot) || 
                        IsValidMove(currentSlot, targetSlot)))
                {
                    return false;
                }
            }
        }
    }
    PrintTheWinner((statusGame[parseInt(visualBoard.id, 10)].IsWhiteTurn) ? "Red Win!!!": "White Win", visualBoard);
    return true;
}

function PrintTheWinner(textOutput, visualBoard)
{
    if(visualBoard.querySelector('.modal-background'))
    {
        return;
    }
    const modal_background = document.createElement('div');
    modal_background.classList.add('modal-background');
    visualBoard.appendChild(modal_background);
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal_background.appendChild(modal);
    modal.textContent = textOutput;
    const buttonOk = document.createElement('button');
    buttonOk.id = 'buttonOkWin';
    buttonOk.textContent = 'Ok';
    modal.appendChild(buttonOk);

    const button = visualBoard.querySelector('#buttonOkWin');
    if(button && !button.hasAttribute('data-listener'))
    {
        button.addEventListener('click', () => {
            modal.remove();
        });
        button.setAttribute('data-listener', 'true');
    }
}

function PromotionToKing(boardModel, currentSlot)
{
    if (currentSlot.color !== 'black' || currentSlot.piece === null) 
    {
        return false;
    }

    currentSlot.piece.isKing = true;
    if(continueChainForTheKing(boardModel, currentSlot))
    {
        statusGame[parseInt(visualBoard.id, 10)].promotedAndNeedToChain = true;
    }
    return true;
}

function IsValidMove(currentSlot, targetSlot)
{
    const currentId = currentSlot.id;
    const targetId = targetSlot.id;
    const rowDifference = Math.floor(targetId / 8) - Math.floor(currentId / 8);
    const colDifference = (targetId % 8) - (currentId % 8);
    const isWhitePiece = currentSlot.piece.color === 'white';

    if(targetSlot.piece !== null)
    {
        return false;
    }

    if (Math.abs(rowDifference) === 1 && Math.abs(colDifference) === 1)
    {
        if ((isWhitePiece && rowDifference === -1) || (!isWhitePiece && rowDifference === 1)) {
            return true;
        }
    }

    return false;
}

function MovePiece(boardModel, visualBoard, currentSlot, targetSlot) 
{
    const targetSlotId = targetSlot.id;
    if(IfNeededDoBurn(boardModel, visualBoard) || IfNeededDoBurnToKing(boardModel, visualBoard))
    {
        console.log('burned!');
    }
        
    const targetRow = Math.floor(targetSlotId / 8); 
    const targetCol = targetSlotId % 8; 
    const currentPiece = currentSlot.piece; 

    if (currentSlot.piece !== null && boardModel[targetRow][targetCol].piece === null) 
    {
        currentSlot.piece.isSelected = false;
        boardModel[targetRow][targetCol].piece = {
            color: currentPiece.color,
            isKing: currentPiece.isKing,
            isSelected: currentSlot.isSelected
        };
        currentSlot.piece = null;
        const targetId = boardModel[targetRow][targetCol].id;
        if((targetId >= 0 && targetId < 8 && statusGame[parseInt(visualBoard.id, 10)].IsWhiteTurn) || (targetId >= 56 && targetId < 64 && !statusGame[parseInt(visualBoard.id, 10)].IsWhiteTurn))
        {
            PromotionToKing(boardModel, targetSlot);
        }
    }
}
function DoEat(boardModel, currentSlot, targetSlot)
{
    const isWhitePiece = currentSlot.piece.color === "white";
    const currentId = currentSlot.id;
    const targetId = targetSlot.id;
    const targetRow = Math.floor(targetId / 8); 
    const targetCol = targetId % 8; 
    const rowDifference = Math.floor(targetId / 8) - Math.floor(currentId / 8);
    const colDifference = (targetId % 8) - (currentId % 8);
    currentSlot.piece.isSelected = false;
 
    if (Math.abs(rowDifference) === 2  && Math.abs(colDifference) === 2) {
        if ((isWhitePiece && rowDifference === -2) || (!isWhitePiece && rowDifference === 2))
        {
            const middleRow = (Math.floor(currentId / 8) + Math.floor(targetId / 8)) / 2;
            const middleCol = ((currentId % 8) + (targetId % 8)) / 2;
            const middleSlotId = middleRow * 8 + middleCol;
            const middleSlot = FindElement(boardModel, middleSlotId);
    
            if (middleSlot && middleSlot.piece !== null) 
            {
                const middlePiece = middleSlot.piece;
                const isOpponentPiece = isWhitePiece? middlePiece.color === 'red': middlePiece.color === 'white';
                
                if(isOpponentPiece)
                {
                    boardModel[targetRow][targetCol].piece = {
                        color: currentSlot.piece.color,
                        isKing: currentSlot.piece.isKing,
                        isSelected: currentSlot.piece.isSelected
                    };
                    currentSlot.piece = null;
                    middleSlot.piece = null;
                    if((targetId >= 0 && targetId < 8) || (targetId >= 56 && targetId < 64))
                    {
                        PromotionToKing(boardModel, targetSlot);
                    }
                    return true;
                }
            }
        }
    }
    if(statusGame[parseInt(visualBoard.id, 10)].isChaining)
    {
        const currentId = currentSlot.id;
        const directions = [
            { row: -2, col: -2 }, 
            { row: -2, col: 2 },  
            { row: 2, col: -2 },  
            { row: 2, col: 2 }   
        ];

        const isWhitePiece = currentSlot.piece.color === "white";

        for (const direction of directions) 
        {
            const targetRow = Math.floor(currentId / 8) + direction.row;
            const targetCol = (currentId % 8) + direction.col;

            if (targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8) {
                const targetSlotDirectionId = targetRow * 8 + targetCol;
                const targetSlotDirection = FindElement(boardModel, targetSlotDirectionId);
                const middleRow = Math.floor(currentId / 8) + direction.row / 2;
                const middleCol = (currentId % 8) + direction.col / 2;
                const middleSlotId = middleRow * 8 + middleCol;
                const middleSlot = FindElement(boardModel, middleSlotId);
    
                if (targetSlot && targetSlot.piece === null && middleSlot && middleSlot.piece !== null && targetSlot.id === targetSlotDirectionId) 
                {
                    const isOpponentPiece = isWhitePiece? FindRedPieces(boardModel, false) : FindWhitePieces(boardModel, false);
                    
                    if (isOpponentPiece) 
                    {
                        boardModel[targetRow][targetCol].piece = {
                            color: currentSlot.piece.color,
                            isKing: currentSlot.piece.isKing,
                            isSelected: currentSlot.piece.isSelected
                        };
                        currentSlot.piece = null;
                        middleSlot.piece = null;
                        return true; 
                    }
                }
            }
        }
        return false;
    }
    return false;
}

function DoEatForKing(boardModel, currentSlot, targetSlot, toEatSlot)
{
    const targetId = targetSlot.id;
    const targetRow = Math.floor(targetId / 8); 
    const targetCol = targetId % 8; 

    currentSlot.piece.isSelected = false;
    boardModel[targetRow][targetCol].piece = {
        color: currentSlot.piece.color,
        isKing: currentSlot.piece.isKing,
        isSelected: currentSlot.piece.isSelected
    };
    currentSlot.piece = null;
    toEatSlot.piece = null;
}

function CheckIfCanEat(boardModel, currentSlot, targetSlot)
{
    const currentId = currentSlot.id;
    const targetId = targetSlot.id;
    const rowDifference = Math.floor(targetId / 8) - Math.floor(currentId / 8);
    const colDifference = (targetId % 8) - (currentId % 8);
    const isWhitePiece = currentSlot.piece.color === 'white';

    if(targetSlot.piece !== null)
    {
        return false;
    }

    if (Math.abs(rowDifference) === 2  && Math.abs(colDifference) === 2) {
        if ((isWhitePiece && rowDifference === -2) || (!isWhitePiece && rowDifference === 2))
        {
            const middleRow = (Math.floor(currentId / 8) + Math.floor(targetId / 8)) / 2;
            const middleCol = ((currentId % 8) + (targetId % 8)) / 2;
            const middleSlotId = middleRow * 8 + middleCol;
            const middleSlot = FindElement(boardModel, middleSlotId);

            if (middleSlot && middleSlot.piece !== null) 
            {
                const middlePiece = middleSlot.piece;
                const isOpponentPiece = isWhitePiece? middlePiece.color === 'red': middlePiece.color === 'white';
                
                if(isOpponentPiece)
                {
                    return true;
                }
            }
        }
    }
    if(statusGame[parseInt(visualBoard.id, 10)].isChaining)
    {
        const currentId = currentSlot.id;
        const directions = [
            { row: -2, col: -2 }, 
            { row: -2, col: 2 },  
            { row: 2, col: -2 },  
            { row: 2, col: 2 }   
        ];

        const isWhitePiece = currentSlot.piece.color === "white";

        for (const direction of directions) 
        {
            const targetRow = Math.floor(currentId / 8) + direction.row;
            const targetCol = (currentId % 8) + direction.col;

            if (targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8) {
                const targetSlotDirectionId = targetRow * 8 + targetCol;
                const targetSlotDirection = FindElement(boardModel, targetSlotDirectionId);
                const middleRow = Math.floor(currentId / 8) + direction.row / 2;
                const middleCol = (currentId % 8) + direction.col / 2;
                const middleSlotId = middleRow * 8 + middleCol;
                const middleSlot = FindElement(boardModel, middleSlotId);
                const middlePiece = middleSlot.piece;
    
                if (targetSlot && targetSlot.piece === null && middleSlot && middleSlot.piece !== null && targetSlot.id === targetSlotDirectionId) 
                {
                    const isOpponentPiece = isWhitePiece? middlePiece.color === 'red': middlePiece.color === 'white';
                    if (isOpponentPiece) 
                    {
                        return true; 
                    }
                }
            }
        }
        return false;
    }
    
    return false;
}

function IsKingValidMove(boardModel, currentSlot, targetSlot)
{
    const currentId = currentSlot.id;
    const targetId = targetSlot.id;
    const rowDifference = Math.floor(targetId / 8) - Math.floor(currentId / 8);
    const colDifference = (targetId % 8) - (currentId % 8);

    if (targetSlot.piece !== null) 
    {
        return false;
    }

    const remainderRow = Math.abs(rowDifference);
    const remainderCol = Math.abs(colDifference);

    if (remainderRow !== remainderCol || targetSlot.color === 'white') 
    {
        return false;
    }

    const rowDirection = rowDifference > 0 ? 1 : -1;
    const colDirection = colDifference > 0 ? 1 : -1;

    let currentCheckRow = Math.floor(currentId / 8) + rowDirection;
    let currentCheckCol = (currentId % 8) + colDirection;
    const targetRow = Math.floor(targetId / 8);
    const targetCol = targetId % 8;

    while (currentCheckRow !== targetRow || currentCheckCol !== targetCol) 
    {
        const checkSlotId = currentCheckRow * 8 + currentCheckCol;
        const checkSlot = FindElement(boardModel, checkSlotId);

        if (checkSlot && checkSlot.piece !== null) 
        {
            return false;
        }

        currentCheckRow += rowDirection;
        currentCheckCol += colDirection;
    }

    return true;
}

function CheckIfKingCanEat(boardModel, currentSlot, targetSlot) 
{
    const currentId = currentSlot.id;
    const targetId = targetSlot.id;
    const rowDifference = Math.floor(targetId / 8) - Math.floor(currentId / 8);
    const colDifference = (targetId % 8) - (currentId % 8);
    const isWhitePiece = currentSlot.piece.color === 'white';
    let pieceFound = false;
    let middleSlot = null;

    if (targetSlot.piece !== null) 
    {
        return middleSlot; 
    }

    const remainderRow = Math.abs(rowDifference);
    const remainderCol = Math.abs(colDifference);

    if (remainderRow !== remainderCol) 
    {
        return middleSlot; 
    }

    const rowDirection = rowDifference > 0 ? 1 : -1;
    const colDirection = colDifference > 0 ? 1 : -1;

    let currentCheckRow = Math.floor(currentId / 8) + rowDirection;
    let currentCheckCol = (currentId % 8) + colDirection;
    const targetRow = Math.floor(targetId / 8);
    const targetCol = targetId % 8;

    while (currentCheckRow !== targetRow || currentCheckCol !== targetCol) 
    {
        const checkSlotId = currentCheckRow * 8 + currentCheckCol;
        const checkSlot = FindElement(boardModel, checkSlotId); 

        if (checkSlot && checkSlot.piece !== null) 
        {
            if (pieceFound) 
            {
                return null; //there is more then one sulder
            }

            const piece = checkSlot.piece;
            const isOpponentPiece = isWhitePiece ? piece.color === "red" : piece.color === "white";

            if (isOpponentPiece) 
            {
                pieceFound = true;
                middleSlot = checkSlot; 
            } 
            else 
            {
                return middleSlot; //there is sulder to us 
            }
        }

        currentCheckRow += rowDirection;
        currentCheckCol += colDirection;
    }

    if(pieceFound && middleSlot)
    {
        return middleSlot;
    }

    return middleSlot;
}

function continueChain(boardModel, currentSlot) {
    if (Chain(boardModel, currentSlot)) 
    {
        return true;
    } 
    else 
    {
       return false;
    }
}
function continueChainForTheKing(boardModel, currentSlot)
{
    if (ChainToKing(boardModel, currentSlot)) 
    {
        return true;
    } 
    else 
    {
        return false;
    }
}

function IfNeededDoBurnToKing(boardModel, visualBoard)
{
    const pieces = statusGame[parseInt(visualBoard.id, 10)].IsWhiteTurn ? FindWhitePieces(boardModel, true) : FindRedPieces(boardModel, true);
    for (let piece of pieces) {
        for (let i = 0; i < 8; i++) 
        {
            for (let j = 0; j < 8; j++) 
            {
                const targetSlotId = i * 8 + j;
                const targetSlot = FindElement(boardModel, targetSlotId);
                if (targetSlot.color === 'black' && CheckIfKingCanEat(boardModel, piece, targetSlot)) 
                {
                    piece.piece = null;
                    return true; 
                }
            }
        }
    }
    return false;
}

function IfNeededDoBurn(boardModel, visualBoard)
{
    const pieces = statusGame[parseInt(visualBoard.id, 10)].IsWhiteTurn ? FindWhitePieces(boardModel, false) : FindRedPieces(boardModel, false);
    for(let piece of pieces)
    {
        for (let i = 0; i < 8; i++) 
        {
            for (let j = 0; j < 8; j++)
            {
                const targetSlotId = i * 8 + j;
                const targetSlot = FindElement(boardModel, targetSlotId);
                if (targetSlot.color === 'black' && CheckIfCanEat(boardModel, piece, targetSlot))
                {
                    piece.piece = null;
                    return true; 
                }
            }
        }
    }
    return false;
}

function Chain(boardModel, currentSlot)
{
    const currentId = currentSlot.id;
    const directions = [
        { row: -2, col: -2 }, 
        { row: -2, col: 2 },  
        { row: 2, col: -2 },  
        { row: 2, col: 2 }   
    ];

    const isWhitePiece = currentSlot.piece.color === "white";

    for (const direction of directions) 
    {
        const targetRow = Math.floor(currentId / 8) + direction.row;
        const targetCol = (currentId % 8) + direction.col;

        if (targetRow >= 0 && targetRow < 8 && targetCol >= 0 && targetCol < 8) {
            const targetSlotId = targetRow * 8 + targetCol;
            const targetSlot = FindElement(boardModel, targetSlotId);

            if (targetSlot && CheckIfCanEat(boardModel, currentSlot, targetSlot)) 
            {
                return true; 
            }
             // חישוב מיקום אמצע
             const middleRow = Math.floor(currentId / 8) + direction.row / 2;
             const middleCol = (currentId % 8) + direction.col / 2;
             const middleSlotId = middleRow * 8 + middleCol;
             const middleSlot = FindElement(boardModel, middleSlotId);
 
             // בדיקה אם משבצת המטרה ריקה ומשבצת האמצע מכילה חייל יריב
             if (targetSlot && targetSlot.piece === null && middleSlot && middleSlot.piece !== null) 
            {
                const middlePiece = middleSlot.piece;
                const isOpponentPiece = isWhitePiece ? middlePiece.color === "red" : middlePiece.color === "white";

                if (isOpponentPiece) 
                {
                    return true; 
                }
            }
        }
    }
    return false;
}

function ChainToKing(boardModel, currentSlot)
{
    for (let i = 0 ; i < 8; i++) 
    {
        for(let j = 0; j < 8; j++)
        {
            const targetSlotId = i * 8 + j;
            const targetSlot = FindElement(boardModel, targetSlotId);
            if (targetSlot && CheckIfKingCanEat(boardModel, currentSlot, targetSlot) !== null) 
            {
                return true; 
            }
        }
       
    }
    return false;
}
