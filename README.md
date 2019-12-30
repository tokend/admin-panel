# Introduction

The TokenD admin-panel is written on [Vue v2](https://vuejs.org/v2/guide/)

# How to
## Run the project

1. Install node.js (Go to [official website](https://nodejs.org/en/) for the help)
2. Install git (Go to [git install instructions](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) for the help)
3. Clone the repository: `git clone https://github.com/tokend/admin-panel.git`
4. In project folder, execute: `npm install`
5. To start project on local server in development mode, execute: `npm run dev`
6. Open http://localhost:8091 in browser.

To stop local server, press `Ctrl + C` in terminal.

If the remote repository was updated, you need to execute `git pull` command on your local machine to get the updates. To restart the project, repeat step 4 and 5 of this instruction.

## Configure your instance
All the environment files are located in `config` directory. You have to edit one of them
to change the hostnames of `horizon`, `api` and `storage` servers and `network_passphrase`
- `dev-local.env.js` is used for the local built instances
- `prod.env.js` is used for the instances built for production
- `default.env.js` contains default configuration of the application and may be included
  and merged into other `.env` files

To run the application in local development mode run `npm run dev`  
To build the application for production run `npm run build.prod`
