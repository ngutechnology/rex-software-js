require('dotenv').config({ slient: true });

const Values = require('test-values');
const expect = require('code').expect;

const Rex = require('../lib');


describe('Setup', () => {
    
    it('can describe a random service', (done) => {
        let service = Values.random(Rex.SERVICES);
        Rex[service].describe().then((response) => {
            expect(response).to.not.be.null();
            
            expect(response).to.include('name', 'description', 'methods');
            expect(Object.keys(response.methods).length).to.be.above(0);
            
            done();
        });
    });
        
    
    it('configures methods', (done) => {
        Rex.SERVICES.forEach((service_name) => {
            let service = Rex[service_name];
            let method_names = Object.keys(service);
            
            expect(method_names.length).to.be.above(1);
            method_names.forEach((method) => {
                expect(typeof service[method]).to.equal('function');
            });
        });
        
        done();
    });

});


describe("Authentication", () => {
    it('fails on a bad login', (done) => {
        Rex.Authentication.login({ email: 'bad', password: 'bad' }).catch((err) => {
            expect(err.type).to.equal('AuthenticationException');
            done();
        });
    });
    
    it("saves and uses the token on login", (done) => {
        Rex.Authentication.login({ email: process.env.EMAIL, password: process.env.PASSWORD }).then((token) => {
            expect(Rex.token).to.not.be.null();
            
            // Make sure the token works
            Rex.Properties.search().then((results) => {
                expect(results).to.include('rows', 'total');
                expect(results.rows[0]).to.include('_id');
                done();
            });
        });
    });
    
    it("can use the shorthand method", (done) => {
        Rex.login(process.env.EMAIL, process.env.PASSWORD).then((token) => {
            expect(Rex.token).to.not.be.null();
            expect(Rex.token).to.equal(token);
            done();
        });
    });
    
    it("clears the token on logout", (done) => {
        Rex.Authentication.logout().then(() => {
            expect(Rex.token).to.be.null();
            done();
        });
    });
});


describe("ID shorthand", () => {
    beforeEach((done) => {
        Rex.login(process.env.EMAIL, process.env.PASSWORD).then(() => done());
    });
    
    it("can read IDs with using { id: 68 }", (done) => {
        Rex.Listings.read({ id: 68, fields: ['property_core' ]}).then((listing) => {
            expect(listing).to.include(['_id', 'system_listing_state', 'property']);
            expect(listing._id).to.equal(68);
            done();
        });
    });
    
    it("can read IDs without using { id: 68 }", (done) => {
        Rex.Listings.read(68, { fields: ['property_core' ]}).then((listing) => {
            expect(listing).to.include(['_id', 'system_listing_state', 'property']);
            expect(listing._id).to.equal(68);
            done();
        });
    });
});


describe("#point_to_location", () => {
    it('nulls out a bad POINT() value', (done) => {
        let location = Rex.pointToLocation('bad value');
        
        expect(location.lat).to.equal(null);
        expect(location.lng).to.equal(null);
        
        done();
    });
    
    it('converts a POINT() value to a { lat, lng } object', (done) => {
        let point = 'POINT(-38.294285 143.175875)';
        let location = Rex.pointToLocation(point);
        
        expect(location.lat).to.equal(-38.294285);
        expect(location.lng).to.equal(143.175875);
        
        done();
    });
});