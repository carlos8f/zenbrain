# Zenbrain

Zenbrain is an integrated Node.js toolkit for building "intelligent" programs, capable of responding to and learning from real-world data. At its heart is an efficient data processing pipeline, and a modular event handling workflow. Zenbrain includes:

- a clean, pluggable framework
- a map/reduce pipeline for live-computing against APIs
- a method for defining custom bot logic with simple JS functions

## zenbrain.js

Exports a basic API for building a new program with Zenbrain embedded in it.

### USAGE

In your program folder, `npm install --save zenbrain`, and then create an executable file:

```js
#!/usr/bin/env node
var version = require('./package.json').version
USER_AGENT = 'your_program/' + version
var zenbrain = require('zenbrain')
var brain = zenbrain(__dirname, 'your_program')
brain.cli()
```

Zenbrain will now spawn a new CLI app for you containing some default commands. See [this guide](todo) for how to build your own program.

## config.js

The default configuration is here. overridden by placing a `config.js` in your program's folder.

## _codemap.js

Exposes `zenbrain` as a codemap. Advanced users only :)

## core

Required components of Zenbrain.

### actions

CLI command handlers - the logic that runs when a command is invoked.

### commands

JSON files that define each command and its associated options.

#### forget

"Forget" a command's run state.

#### launch

Launch multiple commands.

#### map

"Map" incoming data, as in live data feeds.

#### reduce

"Reduce" mapped data, transforming it into ticks.

#### run

"Run" Zenbrain logic, inputting ticks and outputting actions.

#### sim

"Simulate" Zenbrain logic, inputting a time period and outputting a fitness score.

#### status

Show Zenbrain's internal status.

### db

Define MongoDB collections used by Zenbrain.

#### actions

@todo

#### cache

@todo

#### indexes

Define MongoDB indexes used by Zenbrain.

#### locks

Locks on database entries.

#### logs

Tailable ANSI-ified log messages.

#### run_states

State information scoped to each command.

#### thoughts

### launcher

### learner

### logger

### mapper

### reducer

### runner

## examples

### zen_crawler

### zen_ebooks

## extras

@todo

## utils

###