export interface VariantValue {
  value: string
  variantOption: {
    name: string
  }
}

export interface ProductVariantValue {
  variantValue: VariantValue
}

export interface RawVariant {
  id: string
  sku: string | null
  price: string | null
  inventory: number | null
  productVariantValues: ProductVariantValue[]
}

/**
 * VariantResolver provides O(1) lookup for product variants based on selected options.
 */
export class VariantResolver {
  private variantMap: Map<string, RawVariant>

  constructor(variants: RawVariant[]) {
    this.variantMap = new Map()
    for (const variant of variants) {
      const key = this.generateKeyFromRaw(variant.productVariantValues)
      this.variantMap.set(key, variant)
    }
  }

  /**
   * Generates a unique key for a set of option values.
   * Format: "Option1:Value1|Option2:Value2" (sorted by option name)
   */
  private generateKey(optionValues: Array<{ optionName: string; value: string }>): string {
    return optionValues
      .sort((a, b) => a.optionName.localeCompare(b.optionName))
      .map((ov) => `${ov.optionName}:${ov.value}`)
      .join('|')
  }

  private generateKeyFromRaw(pvv: ProductVariantValue[]): string {
    const optionValues = pvv.map((p) => ({
      optionName: p.variantValue.variantOption.name,
      value: p.variantValue.value,
    }))
    return this.generateKey(optionValues)
  }

  /**
   * Resolves a variant from a record of selected options.
   * @param selectedOptions e.g., { "Color": "Red", "Size": "M" }
   */
  resolve(selectedOptions: Record<string, string>): RawVariant | undefined {
    const optionValues = Object.entries(selectedOptions).map(([optionName, value]) => ({
      optionName,
      value,
    }))
    const key = this.generateKey(optionValues)
    return this.variantMap.get(key)
  }
}
