import { useState } from "react";

const NO_PLAYER = -1;

const LeverGame = () => {
  const [playerNumber, setPlayerNumber] = useState(NO_PLAYER);
  const startGame = (newPlayerNumber: number) => {
    setPlayerNumber(newPlayerNumber);
  };
  return (
    <div>
      {playerNumber === NO_PLAYER ? (
        <PickPlayerForm setPlayerNumber={startGame} />
      ) : (
        <p>game is started {playerNumber}</p>
      )}
    </div>
  );
};

const PickPlayerForm = (props: any) => {
  const [playerNumber, setPlayerNumber] = useState("");

  return (
    <>
      <p>What player are you?</p>
      <input onChange={(e) => setPlayerNumber(e.target.value)} />
      <button onClick={() => props.setPlayerNumber(playerNumber)}>
        Submit
      </button>
    </>
  );
};

export default LeverGame;
