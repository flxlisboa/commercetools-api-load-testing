const { expect } = require('chai')
const draftBuilder = require('../../../src/products/draft-builder')

describe('::draft-builder::', () => {
  const badProductType = {
    name: 'test product type',
    attributes: [
      {
        name: 'test attr 1',
        label: {
          de: 'test attr 1',
        },
        type: {
          name: 'wrongType',
        },
      },
    ],
  }

  it('should throw error when attribute type is wrong', () => {
    try {
      draftBuilder.buildProductDraft('test', {}, badProductType, {}, [1, 2, 3])
      expect.fail('Build product draft should fail')
    } catch (e) {
      expect(e.message).to.equal(
        'Unknown product attribute type {"name":"wrongType"}'
      )
    }
  })
})
