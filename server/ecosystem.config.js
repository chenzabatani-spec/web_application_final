module.exports = {
  apps : [{
    name   : "backend-server",
    script : "./dist/server.js",
    env_production: {
       NODE_ENV: "production"
    }
  }]
}
