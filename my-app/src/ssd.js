BLOCK_NUM = 4;
BLOCK_SIZE = 6; // Pages per block

EMPTY = 0;
INVALID = -1;
AUTO_DELETE = true;
GREATEST_KEY_LENGTH = 2;
// initialize the blocks array
var blocks = new Array(BLOCK_NUM);
for (var i = 0; i < BLOCK_NUM; i++) {
  blocks[i] = new Array(BLOCK_SIZE).fill(EMPTY);
}

function deleteBest() {
  var invalid_pages = 0;
  var block_to_delete = 0;
  for (var i = 0; i < BLOCK_NUM; i++) {
    var invalid = 0;
    for (var j = 0; j < BLOCK_SIZE; j++) {
      if (blocks[i][j] == INVALID) {
        invalid++;
      }
    }
    if (invalid > invalid_pages) {
      invalid_pages = invalid;
      block_to_delete = i;
    }
  }
  console.log(
    "Deleting block " +
      block_to_delete +
      " with " +
      invalid_pages +
      " invalid pages"
  );
  deleteBlock(block_to_delete);
}

function write(block, page, file_key) {
  // If only the last block is empty then delete the block with most invalid pages
  if (AUTO_DELETE) {
    if (blocks[BLOCK_NUM - 2][BLOCK_SIZE - 1] != EMPTY) {
      console.log("Detected last block is full");
      deleteBest();
    }
  }
  // Invalidate first page of same file_number
  for (var i = 0; i < BLOCK_NUM; i++) {
    for (var j = 0; j < BLOCK_SIZE; j++) {
      if (blocks[i][j] == file_key) {
        blocks[i][j] = INVALID;
        console.log("Invalidating (" + i + ", " + j + ") " + file_key);
        break;
      }
    }
  }
  blocks[block][page] = file_key;
  console.log("Writing (" + block + ", " + page + ") " + file_key);
}

function deleteBlock(block) {
  for (var i = 0; i < BLOCK_SIZE; i++) {
    blocks[block][i] = EMPTY;
  }
}

function writeNext(file_key) {
  for (var i = 0; i < BLOCK_NUM; i++) {
    for (var j = 0; j < BLOCK_SIZE; j++) {
      if (blocks[i][j] == EMPTY) {
        blocks[i][j] = file_key;
        console.log("Writing (" + i + ", " + j + ") " + file_key);
        return;
      }
    }
  }
  console.log("No available pages");
}

class LazyLogger {
  constructor() {
    this.logs = [];
  }
  getLog() {
    return this.logs;
  }
  newLog() {
    this.logs.push([]);
  }
  write(message) {
    // Add in same message
    if (this.logs.length == 0) {
      this.logs.push([]);
    }
    if (this.logs[this.logs.length - 1].length == 0) {
      this.logs[this.logs.length - 1].push(message);
    } else {
      this.logs[this.logs.length - 1][
        this.logs[this.logs.length - 1].length - 1
      ] += message;
    }
  }
  log(message) {
    this.logs[this.logs.length - 1].push(message);
  }
  print() {
    // Print the logs next to each other
    console.log(this.logs);
    // Print the first message of each log, then the second, then the third, etc.
    var most_in_row = 3;
    while (this.logs.length > most_in_row) {
      for (var i = 0; i < most_in_row; i++) {
        for (var j = 0; j < this.logs[i].length; j++) {
          process.stdout.write(this.logs[i][j]);
          process.stdout.write(" ");
        }
        console.log("");
      }
      this.logs = this.logs.slice(most_in_row, this.logs.length);
    }

  }
}

function printBlock(block, logger) {
  // visually print the block
  /*
  | | | | |x| | |
  | | | | | | | |
  | | | | | | | |

 */

  logger.newLog();
  for (var i = 0; i < BLOCK_SIZE; i++) {
    // square shape
    if (i % Math.floor(Math.sqrt(BLOCK_SIZE)) == 0 && i != 0) {
      logger.log("");
    }
    if (blocks[block][i] == EMPTY) {
      logger.write("| |");
    } else if (blocks[block][i] == INVALID) {
      logger.write("|x|");
    } else {
      logger.write("|" + blocks[block][i] + "|");
    }
    // Create spaces according to string length
    for (var j = 0; j < GREATEST_KEY_LENGTH - blocks[block][i].length; j++) {
      logger.write(" ");
    }
    logger.write(" ");
  }
}

function printBlocks(logger) {
  for (var i = 0; i < BLOCK_NUM; i++) {
    printBlock(i, logger);
  }
}
// WriteNext (Writes on the next available page)
// Invalidate
// Writing 30,000 pages / 1,000 blocks of A files
key = 1;
for (var i = 0; i < BLOCK_NUM * BLOCK_SIZE; i++) {
  writeNext("A" + key);
  key++;
}
// Writing 30,000 pages / 1,000 blocks of B files
// key = 1;
// for (var i = 100; i < 200; i++) {
//   for (var j = 0; j < 3; j++) {
//     writeNext("B" + key);
//     key++;
//   }
// }

// Re-Writing 30,000 pages / 1,000 blocks of A files
// key = 1;
// for (var i = 0; i < 100; i++) {
//   for (var j = 0; j < 3; j++) {
//     writeNext("A" + key);
//     key++;
//   }
// }
var logger = new LazyLogger();
printBlocks(logger);
logger.print();
