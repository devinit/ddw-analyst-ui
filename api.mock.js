const faker = require('faker');

const generateDataSources = () => {
    let dataSources = [];

    for (let count = 0; count < 30; count++) {
      const columns = [];
      for (let c = 0; c < 5; c++) {
        columns.push(
          {
            name: faker.random.word(),
            displayName: faker.random.word(),
            metadata: {
              description: faker.random.words(),
              updated: faker.date.past()
            }
          }
        );
      }

      dataSources.push({
        tableId: faker.lorem.slug(),
        name: faker.random.words(),
        columns,
        metadata: {
          description: faker.random.words(),
          updated: faker.date.past(),
          source: faker.random.words(),
          created: faker.date.past()
        },
        published: faker.random.boolean()
      });
    }

    return { data_sources: dataSources };
};

module.exports = generateDataSources;
