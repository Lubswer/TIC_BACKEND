import { CategoriaProducto } from '../enums/CategoriaProducto.js';

export class Producto {
  id?: number;
  nombre: string;
  categoria: CategoriaProducto;
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
    categoria: CategoriaProducto,
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
    this.categoria = categoria;
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
    if (this.stock === null) return;

    if (!this.tieneStockSuficiente(cantidad)) {
      throw new Error(`Stock insuficiente para el producto "${this.nombre}".`);
    }

    this.stock -= cantidad;

    if (this.stock === 0) {
      this.disponible = false;
    }
  }

  reponerStock(cantidad: number): void {
    if (cantidad <= 0) {
      throw new Error('La cantidad a reponer debe ser mayor a 0.');
    }

    if (this.stock === null) {
      this.stock = cantidad;
    } else {
      this.stock += cantidad;
    }

    if (this.stock > 0) {
      this.disponible = true;
    }
  }

  desactivar(): void {
    this.activo = false;
    this.disponible = false;
  }

  reactivar(): void {
    this.activo = true;
    this.disponible = true;
  }
}
