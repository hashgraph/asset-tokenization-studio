const http = require('k6/http')
const k6 = require('k6')

const ASSET_ID = '3779210e-b0d3-4a4f-bf5c-5e4bfd1a0e30'

module.exports.options = {
    discardResponseBodies: true,
    scenarios: {
        contacts: {
            executor: 'per-vu-iterations',
            vus: 50,
            iterations: 1,
        },
    },
}

module.exports.default = function () {
    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    const request = {
        subtype: 'IMMEDIATE',
        amount: '0.01',
        amountType: 'FIXED',
        concept: 'load testing',
    }
    const response = http.post(`http://localhost:3000/assets/${ASSET_ID}/distributions/payout`, JSON.stringify(request), params)
    k6.check(response, {
        'Response status is 201': (r) => r.status === 201,
    });
};