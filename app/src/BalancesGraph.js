import { abs, floor, max, min } from "mathjs";

const NODE_RADIUS = 20;
const MARGIN = 100;
const SPACING = 30;
const ARROW_LENGTH = 100;

const TEXT_SHIFT = 3;
const BORDER = 3;

//Derived constants
const LEFT_COLUMN = MARGIN + NODE_RADIUS;
const RIGHT_COLUMN = MARGIN + 3 * NODE_RADIUS + ARROW_LENGTH;

function yGridPos(n) {
  //returns the nth y coordinate in the grid
  return MARGIN + (2 * NODE_RADIUS + SPACING) * n + NODE_RADIUS;
}

function neutralGridPos(height) {
  //Returns the y coord of the neutral elements
  return yGridPos(height - 1) + 2 * NODE_RADIUS + 2 * MARGIN;
}

function getWidth() {
  return ARROW_LENGTH + 4 * NODE_RADIUS + 2 * MARGIN;
}

function getHeight(height) {
  return neutralGridPos(height) + NODE_RADIUS + MARGIN;
}
function colorMapping(value) {
  //0 returns gray
  //>0 to 1 returns scale of green
  //<0 to -1 returns scale of red
  if (value === 0) {
    return "#808080";
  }
  let size = (1 + abs(value)) / 2;
  let hexString = floor(size * 255).toString(16);

  let color = value > 0 ? "#00" + hexString + "00" : "#" + hexString + "0000";
  return color;
}

function node(value, x, y) {
  //takes a value 0 to 1 to dictate how coloured it should be
  return (
    <circle
      r={NODE_RADIUS}
      cx={x}
      cy={y}
      fill={colorMapping(value)}
      stroke="black"
      stroke-width={BORDER}
    />
  );
}

function sortBalances(names, balances) {
  //takes the list of balances and sorts into those who are positive negative and neutral

  let balance_values = Object.values(balances);

  let positiveBalances = [];
  let negativeBalances = [];
  let neutralBalances = [];
  let max_val, min_val;
  try {
    max_val = max(balance_values);
    min_val = abs(min(balance_values));
  } catch (error) {
    max_val = 1;
    min_val = 1;
  }

  names.forEach((name) => {
    let balance = balances[name];
    let data = { name: name, balance: balance };
    if (balance === 0) {
      data.scaled_balance = 0;
      neutralBalances.push(data);
    }
    if (balance > 0) {
      data.scaled_balance = data.balance / max_val;
      positiveBalances.push(data);
    }
    if (balance < 0) {
      data.scaled_balance = data.balance / min_val;
      negativeBalances.push(data);
    }
  });
  positiveBalances.sort((d1, d2) => d2["balance"] - d1["balance"]);
  for (let i = 0; i < positiveBalances.length; i++) {
    positiveBalances[i]["index"] = i;
  }
  negativeBalances.sort((d1, d2) => d1["balance"] - d2["balance"]);
  for (let i = 0; i < negativeBalances.length; i++) {
    negativeBalances[i]["index"] = i;
  }
  return [positiveBalances, negativeBalances, neutralBalances];
}

function placeNodes(balances, xpos) {
  let nodes = balances.map((data) => {
    return node(data["scaled_balance"], xpos, yGridPos(data["index"]));
  });
  return nodes;
}

function getRepayments(positiveBalances, negativeBalances) {
  //Takes the list of positive and negative balances.
  //Returns the pairs of indices for which arrows should be drawn.
  if (
    negativeBalances === undefined ||
    negativeBalances.length === 0 ||
    positiveBalances === undefined ||
    positiveBalances.length === 0
  ) {
    return [];
  }
  let payer_count = negativeBalances.length;
  let receiver_count = positiveBalances.length;

  let current_payer = 0;
  let current_receiver = 0;
  let repayments = [];
  let current_pot = negativeBalances[0]["balance"];
  let current_to_pay = positiveBalances[0]["balance"];
  //delta is the remaining money to be paid by current_payer (so will be negative whilst they are still the current payer)
  let iterations = 0;
  console.log(payer_count, receiver_count);
  while (
    current_payer < payer_count &&
    current_receiver < receiver_count &&
    iterations < 100
  ) {
    iterations++;
    if (abs(current_to_pay) <= abs(current_pot)) {
      //If there's enough money, pay off in full, and move to next receiver
      repayments.push([current_payer, current_receiver]);
      current_pot += current_to_pay;
      current_receiver++;
      if (current_receiver === receiver_count) {
        break;
      }
      current_to_pay = positiveBalances[current_receiver]["balance"];
    }
    if (abs(current_to_pay) > abs(current_pot)) {
      //If not enough money, pay all that can be paid, and move to next payer
      repayments.push([current_payer, current_receiver]);
      current_to_pay += current_pot;
      current_payer++;
      if (current_payer === payer_count) {
        break;
      }
      current_pot = negativeBalances[current_payer]["balance"];
    }
  }
  return repayments;
}

function placeRepaymentArrows(repayments) {
  let arrows = repayments.map((pair) => {
    let [i, j] = pair;
    return (
      <line
        x1={LEFT_COLUMN}
        y1={yGridPos(i)}
        x2={RIGHT_COLUMN}
        y2={yGridPos(j)}
        style={{ stroke: "black", strokeWidth: 3 }}
      />
    );
  });
  return arrows;
}

function placeNodeLabels(balances, xpos, dx, anchor) {
  let labels = balances.map((data) => (
    <text
      x={xpos + dx}
      y={yGridPos(data["index"])}
      text-anchor={anchor}
      dominant-baseline="middle"
    >
      {data["name"]}
    </text>
  ));
  return labels;
}

function BalancesGraph({ names, balances }) {
  let [positiveBalances, negativeBalances, neutralBalances] = sortBalances(
    names,
    balances
  );
  let height = max(positiveBalances.length, negativeBalances.length);

  let positiveNodes = placeNodes(positiveBalances, RIGHT_COLUMN);
  let negativeNodes = placeNodes(negativeBalances, LEFT_COLUMN);
  let arrows = placeRepaymentArrows(
    getRepayments(positiveBalances, negativeBalances)
  );
  let positiveNodeLabels = placeNodeLabels(
    positiveBalances,
    RIGHT_COLUMN,
    NODE_RADIUS + TEXT_SHIFT,
    "start"
  );
  let negativeNodeLabels = placeNodeLabels(
    negativeBalances,
    LEFT_COLUMN,
    -NODE_RADIUS - TEXT_SHIFT,
    "end"
  );
  return (
    <svg height={getHeight(height)} width={getWidth()}>
      {arrows}
      {positiveNodes}
      {negativeNodes}
      {positiveNodeLabels}
      {negativeNodeLabels}
    </svg>
  );
}

export default BalancesGraph;
