const express = require('express')
const bodyParser = require('body-parser')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const cors = require('cors')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'db.sqlite',
  define: {
    timestamps: false
  }
})

const VirtualShelf = sequelize.define('virtualshelf', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey:true
    },
  content: {
    type:Sequelize.TEXT,
    validate:{
        len:[3,3000]
    }
  },
  date: Sequelize.DATE
})

const Book = sequelize.define('book', {
   id: {
    type: Sequelize.INTEGER,
    primaryKey:true
    },
  title: {
      type:Sequelize.STRING,
      validate:{
        
        len:[5,3000]
      }
  },
  genre: Sequelize.ENUM("Comedy", "Tragedy", "Horror"),
  url:{
      type:Sequelize.STRING,
      validate:{
          isUrl:true
      }
  },
  bookID: {
       type: Sequelize.INTEGER 
  }
});

VirtualShelf.hasMany(Book,{ foreignKey: 'bookID' })

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.get('/sync', async (req, res) => {
  try {
    await sequelize.sync({ force: true })
    res.status(201).json({ message: 'created' })
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.get('/virtualshelfs', async (req, res) => {
  try {
    const query = {}
    const allowedFilters = ['content', 'date']
    const filterKeys = Object.keys(req.query).filter(e => allowedFilters.indexOf(e) !== -1)
    if (filterKeys.length > 0) {
      query.where = {}
      for (const key of filterKeys) {
        query.where[key] = {
          [Op.like]: `%${req.query[key]}%`
        }
      }
    }

    const sortField = req.query.sortField
    let sortOrder = 'ASC'
    if (req.query.sortOrder && req.query.sortOrder === '-1') {
      sortOrder = 'DESC'
    }

    if (sortField) {
      query.order = [[sortField, sortOrder]]
    }

    if (!isNaN(parseInt(req.query.page))) {
      query.limit = pageSize
      query.offset = pageSize * parseInt(req.query.page)
    }

    const records = await VirtualShelf.findAll(query)
    const count = await VirtualShelf.count()
    res.status(200).json({ records, count })
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.post("/virtualShelfs", async (req, res) => {
    try {
      await VirtualShelf.create(req.body);
      res.status(201).json({ message: "created" });
    } catch (err) {
      console.warn(err);
      res.status(500).json({ message: "some error occured" });
    }
  });

app.get('/virtualShelfs/:id', async (req, res) => {
  try {
    const virtualShelf = await VirtualShelf.findByPk(req.params.id,{include:Book})
    if (virtualShelf) {
      res.status(200).json(virtualShelf)
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.put('/virtualShelfs/:id', async (req, res) => {
  try {
    const virtualShelf = await VirtualShelf.findByPk(req.params.id)
    if (virtualShelf) {
      await virtualShelf.update(req.body, { fields: ['content', 'date'] })
      res.status(202).json({ message: 'accepted' })
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.delete('/virtualShelfs/:id', async (req, res) => {
  try {
    const virtualShelf = await VirtualShelf.findByPk(req.params.id, { include: Book })
    if (virtualShelf) {
      await virtualShelf.destroy()
      res.status(202).json({ message: 'accepted' })
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.get('/virtualShelfs/:vid/books', async (req, res) => {
	try{
		const virtualShelf = await VirtualShelf.findByPk(req.params.vid)
		if (virtualShelf){
			const book = await virtualShelf.getBooks()
			res.status(200).json(book)
		}
		else{
			res.status(404).json({message : 'not found'})
		}
	}
	catch(e){
		console.warn(e)
		res.status(500).json({message : 'server error'})
	}
})

app.get('/virtualShelfs/:vid/books/:bid', async (req, res) => {
  try {
    const virtualShelf = await VirtualShelf.findByPk(req.params.vid)
    if (virtualShelf) {
      const book = await virtualShelf.getBooks({ where: { id: req.params.bid } })
     // const book = books.shift()
      res.status(200).json(book.shift())
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.post("/virtualShelfs/:vsid/books", async (req, res) => {
    try {
      const virtualShelf = await VirtualShelf.findByPk(req.params.vsid);
      if (virtualShelf) {
        const book = req.body;
        book.bookID = virtualShelf.id;
        await Book.create(book);
        res.status(201).json({ message: "created" });
      } else {
        res.status(404).json({ message: "not found" });
      }
    } catch (err) {
      console.warn(err);
      res.status(500).json({ message: "some error occured" });
    }
  });

app.put('/virtualShelfs/:bid/books/:cid', async (req, res) => {
  try {
    const virtualShelf = await VirtualShelf.findByPk(req.params.bid)
    if (virtualShelf) {
        const books = await virtualShelf.getBooks({ where: { id: req.params.cid } })
        const book = books.shift()
      if (book) {
        await book.update(req.body)
        res.status(202).json({ message: 'accepted' })
      } else {
        res.status(404).json({ message: 'not found' })
      }
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.delete('/virtualShelfs/:bid/books/:cid', async (req, res) => {
  try {
    const virtualShelf = await VirtualShelf.findByPk(req.params.bid)
    if (virtualShelf) {
      const books = await virtualShelf.getBooks({ where: { id: req.params.cid } })
      const book = books.shift()
      if (book) {
        await book.destroy(req.body)
        res.status(202).json({ message: 'accepted' })
      } else {
        res.status(404).json({ message: 'not found' })
      }
    } else {
      res.status(404).json({ message: 'not found' })
    }
  } catch (e) {
    console.warn(e)
    res.status(500).json({ message: 'server error' })
  }
})

app.listen(8080)
