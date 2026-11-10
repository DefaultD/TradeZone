// src/listings/domain/ListingEntity.ts

export type ListingStatus = 'active' | 'paused' | 'sold' | 'deleted';

export class ListingEntity {
    // ============================================================
    // 🔥 PROPRIEDADES DIRETAS — Muito mais legível
    // ============================================================
    id: number;
    user_id: number;
    card_id: number | null;
    price: number;
    quantity: number;

    description: string | null;
    condition: string | null;
    rarity: string | null;
    language: string | null;

    status: ListingStatus;
    images: string[];

    // ============================================================
    // 🔒 status original vindo do banco (imutável)
    // ============================================================
    private readonly statusBanco: ListingStatus;

    // ============================================================
    // 🔨 CONSTRUTOR PRIVADO — ninguém instancia direto
    // ============================================================
    private constructor(props: {
        id: number;
        user_id: number;
        card_id: number | null;
        price: number;
        quantity: number;
        description: string | null;
        condition: string | null;
        rarity: string | null;
        language: string | null;
        status: ListingStatus;
        images: string[];
    }, statusBanco: ListingStatus) {
        Object.assign(this, props);

        this.statusBanco = statusBanco;

        this.validateInitialState();
    }

    // ============================================================
    // 🏭 FACTORY — SEMPRE use isso
    // Mapper interno + validação de invariantes iniciais
    // ============================================================
    static create(model: any, statusBanco: ListingStatus): ListingEntity {
        return new ListingEntity({
            id: model.id,
            user_id: model.user_id,
            card_id: model.card_id ?? null,

            price: Number(model.price),
            quantity: model.quantity ?? 1,

            description: model.description ?? null,
            condition: model.condition ?? null,
            rarity: model.rarity ?? null,
            language: model.language ?? null,

            status: model.status as ListingStatus,

            images: Array.isArray(model.listing_images)
                ? model.listing_images.map((img) => img.fs_key)
                : [],
        }, statusBanco);
    }

    // ============================================================
    // 🧠 Validações iniciais
    // ============================================================
    private validateInitialState() {
        if (this.price <= 0) {
            throw new Error('O preço deve ser maior que zero.');
        }

        if (this.quantity < 1) {
            throw new Error('A quantidade deve ser pelo menos 1.');
        }

        if (!Array.isArray(this.images)) {
            throw new Error('Images deve ser um array.');
        }

        const valid: ListingStatus[] = ['active', 'paused', 'sold', 'deleted'];
        if (!valid.includes(this.status)) {
            throw new Error('Status inválido.');
        }
    }

    // ============================================================
    // 🔒 Regras baseadas no status original do banco
    // ============================================================
    private ensurePodeAlterar() {
        if (this.statusBanco === 'sold') {
            throw new Error('Anúncio vendido não pode ser alterado.');
        }

        if (this.statusBanco === 'deleted') {
            throw new Error('Anúncio deletado não pode ser alterado.');
        }
    }

    // ============================================================
    // 🔥 MÉTODOS DE DOMÍNIO
    // ============================================================
    pause() {
        this.ensurePodeAlterar();
        this.status = 'paused';
    }

    activate() {
        this.ensurePodeAlterar();
        this.status = 'active';
    }

    softDelete() {
        this.ensurePodeAlterar();
        this.status = 'deleted';
    }

    markAsSold() {
        this.status = 'sold';
    }

    update(data: Partial<Omit<ListingEntity, 'id' | 'user_id' | 'statusBanco'>>) {
        this.ensurePodeAlterar();

        Object.assign(this, data);

        this.validateInitialState();
    }

    addImage(fs_key: string) {
        this.ensurePodeAlterar();
        this.images.push(fs_key);
    }

    removeImage(fs_key: string) {
        this.ensurePodeAlterar();
        this.images = this.images.filter((i) => i !== fs_key);
    }

    // ============================================================
    // 🔄 Conversão final para persistir no Prisma
    // (imagens o service trata separado)
    // ============================================================
    toModel() {
        return {
            id: this.id,
            user_id: this.user_id,
            card_id: this.card_id,
            price: this.price,
            quantity: this.quantity,
            description: this.description,
            condition: this.condition,
            rarity: this.rarity,
            language: this.language,
            status: this.status,
            images: this.images,
        };
    }
}
