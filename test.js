const expect = require('chai').expect;

const Mongoose = require('mongoose').Mongoose;
const Mockgoose = require('mockgoose').Mockgoose;

describe('Document queried', () => {
  let mockgoose, mongoose, User;

  before(async() => {

    // setup of mockgoose
    mongoose = new Mongoose();
    mockgoose = new Mockgoose(mongoose);

    await mockgoose.prepareStorage();
    await mongoose.connect('mongodb://test/test', { useNewUrlParser: true });

    // setup test model
    let schema = new mongoose.Schema({
      firstName: String,
      lastName: String
    });

    schema.method('getFullName', function() {
      return this.firstName + ' ' + this.lastName;
    });

    User = mongoose.model('User', schema);

    // seed data
    await User.create({
      firstName: 'ABC',
      lastName: 'XYZ'
    });
  });

  after(async() => {
    await mockgoose.shutdown();
  });

  describe('without lean option', () => {
    let user;

    before(async() => {
      user = await User.findOne();
    });

    it('should be a mongoose document', async() => {
      expect(user instanceof mongoose.Document).to.be.true;
    });

    it('should have document methods', async() => {
      expect(user).to.have.property('getFullName');
      expect(user.getFullName()).to.equal('ABC XYZ');
    });
  });

  describe('with lean option', () => {
    let user;

    before(async() => {
      user = await User.findOne().lean();
    });

    it('should be a plain javascript object', async() => {
      expect(user instanceof mongoose.Document).to.be.false;
      expect(user instanceof Object).to.be.true;
    });

    it('should not have document methods', async() => {
      expect(user).to.not.have.property('getFullName');
    });

    describe('but hydrated', () => {
      it('should have instance methods', async() => {
        let document = User.hydrate(user);

        expect(document).to.have.property('getFullName');
      });
    });
  });
});
