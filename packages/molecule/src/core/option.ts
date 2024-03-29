import {
  DynamicSizeCodec,
  AnyCodec,
  Infer,
  InferParseInput,
  UnknownCodec,
} from "../codec";
import { BinaryWriter, EMPTY_BUFFER } from "../binary-writer";
import { SafeParseReturnType, parseSuccess } from "../error";

/** @internal */
export class OptionCodec<TCodec extends AnyCodec> extends DynamicSizeCodec<
  Infer<TCodec> | null,
  InferParseInput<TCodec>
> {
  readonly inner: TCodec;

  constructor(name: string, inner: TCodec) {
    super(name);
    this.inner = inner;
  }

  unpack(buffer: Uint8Array, strict?: boolean): Infer<TCodec> | null {
    if (buffer.length > 0) {
      return this.inner.unpack(buffer, strict);
    }
    return null;
  }

  packTo(value: Infer<TCodec> | null, writer: BinaryWriter) {
    if (value !== null && value !== undefined) {
      this.inner.packTo(value, writer);
    }
  }

  pack(value: Infer<TCodec> | null): Uint8Array {
    if (value !== null && value !== undefined) {
      return this.inner.pack(value);
    }
    return EMPTY_BUFFER;
  }

  safeParse(
    input: InferParseInput<TCodec> | null,
  ): SafeParseReturnType<Infer<TCodec> | null> {
    if (input !== null && input !== undefined) {
      return this.inner.safeParse(input);
    }
    return parseSuccess(null);
  }

  getSchema(): string {
    return `option ${this.name} (${this.inner.name});`;
  }

  getDepedencies(): Iterable<UnknownCodec> {
    return [this.inner];
  }
}

/**
 * Codec for the molecule bultin-in type `option`.
 * @group Core Codecs
 * @example
 * ```ts
 * import { mol } from "@ckb-cobuild/molecule";
 * const ByteOpt = mol.option("ByteOpt", mol.byte);
 * ```
 */
export function option<TCodec extends AnyCodec>(
  name: string,
  inner: TCodec,
): OptionCodec<TCodec> {
  return new OptionCodec(name, inner);
}
