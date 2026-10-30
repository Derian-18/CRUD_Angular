import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductoService } from '../services/productos.service';
import { Producto } from '../models/producto.models';

@Component({
  selector: 'app-producto-crud',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crud.component.html',
  styleUrl: './crud.component.css'
})
export class ProductoCrudComponent implements OnInit {
  productos: Producto[] = [];
  productoForm: FormGroup;
  editando: boolean = false;
  idEditando: number | null = null;
  mensaje: string = '';
  tipoMensaje: 'exito' | 'error' | '' = '';

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      precio: ['', [Validators.required, Validators.min(0.01)]],
      categoria: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.obtenerProductos();
  }

  obtenerProductos(): void {
    this.productoService.getProductos().subscribe({
      next: (data: Producto[]) => {
        this.productos = data.slice(0, 5).map((item: Producto, index: number) => ({
          id: item.id,
          nombre: `Producto ${index + 1}`,
          precio: (index + 1) * 100,
          categoria: 'General'
        }));
      },
      error: () => this.mostrarMensaje('Error al cargar la lista de productos.', 'error')
    });
  }

  guardarProducto(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      return;
    }

    const productoData: Producto = this.productoForm.value;

    if (this.editando && this.idEditando !== null) {
      this.productoService.actualizarProducto(this.idEditando, productoData).subscribe({
        next: () => {
          const index = this.productos.findIndex(p => p.id === this.idEditando);
          if (index !== -1) {
            this.productos[index] = { ...productoData, id: this.idEditando! };
          }
          this.mostrarMensaje('Producto actualizado con éxito.', 'exito');
          this.limpiarFormulario();
        },
        error: () => this.mostrarMensaje('Error al actualizar el producto.', 'error')
      });
    } else {
      this.productoService.agregarProducto(productoData).subscribe({
        next: (nuevo: Producto) => {
          nuevo.id = this.productos.length + 1;
          this.productos.push(nuevo);
          this.mostrarMensaje('Producto agregado con éxito.', 'exito');
          this.limpiarFormulario();
        },
        error: () => this.mostrarMensaje('Error al agregar el producto.', 'error')
      });
    }
  }

  cargarProducto(producto: Producto): void {
    this.editando = true;
    this.idEditando = producto.id!;
    this.productoForm.patchValue({
      nombre: producto.nombre,
      precio: producto.precio,
      categoria: producto.categoria
    });
  }

  eliminarProducto(id: number): void {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.productoService.eliminarProducto(id).subscribe({
        next: () => {
          this.productos = this.productos.filter(p => p.id !== id);
          this.mostrarMensaje('Producto eliminado correctamente.', 'exito');
        },
        error: () => this.mostrarMensaje('Error al eliminar el producto.', 'error')
      });
    }
  }

  limpiarFormulario(): void {
    this.productoForm.reset();
    this.editando = false;
    this.idEditando = null;
  }

  mostrarMensaje(texto: string, tipo: 'exito' | 'error'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
      this.tipoMensaje = '';
    }, 4000);
  }
}