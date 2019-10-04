// As we are mocking the googlemap service in googleMaps.test we need to be sure it is executed first

require('./test/api/services/googleMaps.test');
require('./test/api/routes/index.test');
require('./test/api/controllers/index.ctrl.test');
