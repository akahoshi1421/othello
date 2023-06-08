import { useEffect, useState } from 'react';
import styles from './index.module.css';

const Home = () => {
  const [turnColor, setTurnColor] = useState(1);
  const [board, setBoard] = useState([
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 1, 0, 0, 0],
    [0, 0, 0, 1, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ]);

  const [win, setWin] = useState({ black: -1, white: -1 });

  //全てのボードが埋まったら勝敗表示
  useEffect(() => {
    if (win.black === -1) {
      let isZero = false;

      let black = 0;
      let white = 0;

      for (const y of board) {
        for (const x of y) {
          if (x === 0) {
            isZero = true;
            break;
          }

          if (x === 1) black++;
          if (x === 2) white++;
        }
        if (isZero) break;
      }

      //勝敗判定
      if (!isZero) {
        setWin({ black, white });
      }
    }
  }, [board]);

  //直前のターンでパスしたか
  const [isPassFront, setIsPassFront] = useState(false);

  //パス判定
  useEffect(() => {
    if (win.black === -1) {
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          if (turnFunc(x, y, true)) {
            return;
          }
        }
      }

      //パスの場合
      alert('パス');

      //2回パスなので勝敗を出す
      if (isPassFront) {
        alert('これ以上置く場所がないのでゲームを終了しました');
        let white = 0;
        let black = 0;

        for (const y of board) {
          for (const x of y) {
            if (x === 1) black++;
            if (x === 2) white++;
          }
        }

        setWin({ black, white });
        return;
      }

      setIsPassFront(true);
      setTurnColor(3 - turnColor);
    }
  }, [board]);

  const onClick = (x: number, y: number) => {
    turnFunc(x, y, false);
  };

  const turnFunc = (x: number, y: number, vertification: boolean) => {
    let isTurnAble = false;

    const newBoard: number[][] = JSON.parse(JSON.stringify(board));

    const directions: number[][] = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
    ];

    let isSet = false;

    for (const oneDir of directions) {
      //そもそも置けるか
      if (
        board[y][x] === 0 &&
        board[y + oneDir[1]] !== undefined &&
        board[y + oneDir[1]][x + oneDir[0]] !== undefined &&
        board[y + oneDir[1]][x + oneDir[0]] !== 0 &&
        board[y + oneDir[1]][x + oneDir[0]] !== turnColor
      ) {
        //ここからひっくり返すコード
        for (const oneDirOther of directions) {
          const turnes: number[][] = [];
          for (let i = 1; i < 8; i++) {
            //自機が黒の時白だったら次のiへ、0だったりあふれたり1のときに隣が自機だったらbreak
            if (
              board[y + oneDirOther[1] * i] === undefined || //y方向のあふれ
              board[y + oneDirOther[1] * i][x + oneDirOther[0] * i] === undefined || //x方向のあふれ
              board[y + oneDirOther[1] * i][x + oneDirOther[0] * i] === 0 || //0だった場合
              (i === 1 && board[y + oneDirOther[1] * i][x + oneDirOther[0] * i] === turnColor)
            )
              break;

            //検索していって自機を見つけた時(隣の場合は除く)これらを置き換えてbreak
            if (board[y + oneDirOther[1] * i][x + oneDirOther[0] * i] === turnColor && i !== 1) {
              newBoard[y][x] = turnColor;
              isSet = true;
              isTurnAble = true;

              if (!vertification) {
                for (const onePos of turnes) {
                  newBoard[onePos[0]][onePos[1]] = turnColor;
                }
              } else {
                return isTurnAble;
              }

              break;
            }

            //次のfor用に記録しておく
            turnes.push([y + oneDirOther[1] * i, x + oneDirOther[0] * i]);
          }
        }

        isSet && setTurnColor(3 - turnColor);
        isSet && setIsPassFront(false);
      }
    }

    if (!vertification) {
      setBoard(newBoard);
    }

    return isTurnAble;
  };

  return (
    <div className={styles.container}>
      {win.black !== -1 && (
        <>
          <h2 className={styles.win}>
            結果:
            {win.black === win.white ? '引き分け' : win.black > win.white ? '黒の勝ち' : '白の勝ち'}
          </h2>
          <ul>
            <li>黒: {win.black}</li>
            <li>白: {win.white}</li>
          </ul>
        </>
      )}
      {win.black === -1 && <p>{turnColor === 1 ? '黒' : '白'}のターン</p>}

      <div className={styles.board}>
        {board.map((row, y) =>
          row.map((color, x) => (
            <div className={styles.cell} key={`${x}-${y}`} onClick={() => onClick(x, y)}>
              {color !== 0 && (
                <div
                  className={styles.stone}
                  style={{ background: color === 1 ? '#000' : '#fff' }}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
