module.exports = [
  {
    name: 'seed',
    
    migrations: [
      'src/seeds/*.seed.ts'
    ],
    cli: {
      migrationsDir: 'src/seeds',
    }
  }
]