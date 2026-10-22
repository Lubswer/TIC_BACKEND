export class Producto {
  id?: number;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
  precio: number;
  stock: number | null;
  disponible: boolean;
  producto_temporada: boolean; 
  activo: boolean; 
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;

  constructor(
    nombre: string,
    precio: number,
    descripcion: string | null = null,
    imagen_url: string | null = null,
    stock: number | null = null,
    disponible: boolean = true,
    producto_temporada: boolean = false,
    activo: boolean = true,
    id?: number,
    fecha_creacion?: Date,
    fecha_actualizacion?: Date
  ) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.imagen_url = imagen_url;
    this.precio = precio;
    this.stock = stock;
    this.disponible = disponible;
    this.producto_temporada = producto_temporada;
    this.activo = activo;
    this.fecha_creacion = fecha_creacion;
    this.fecha_actualizacion = fecha_actualizacion;
  }

  estaDisponibleParaVenta(): boolean {
    if (!this.activo || !this.disponible) {
      return false;
    }

    if (this.stock !== null && this.stock <= 0) {
      return false;
    }

    return true;
  }

  tieneStockSuficiente(cantidad: number): boolean {
    if (cantidad <= 0) return false;

    if (this.stock === null) {
      return true;
    }

    return this.stock >= cantidad;
  }

  descontarStock(cantidad: number): void {
    if (this.stock === null) {
      return; 
    }

    if (!this.tieneStockSuficiente(cantidad)) {
      throw new Error(
        `Stock insuficiente para el producto '${this.nombre}'. Disponible: ${this.stock}, Solicitado: ${cantidad}`
      );
    }

    this.stock -= cantidad;
  }

  cambiarDisponibilidad(disponible: boolean): void {
    this.disponible = disponible;
  }

  desactivar(): void {
    this.activo = false;
  }

  reactivar(): void {
    this.activo = true;
  }
}
