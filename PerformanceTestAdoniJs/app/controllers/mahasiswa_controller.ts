import type { HttpContext } from '@adonisjs/core/http'
import Database from '@adonisjs/lucid/services/db'
import vine from '@vinejs/vine'


export default class MahasiswaController {
  /**
   * GET /mahasiswa
   */
  async index({ request, response }: HttpContext) {
    try {
      const page = Number(request.input('page', 1))
      const limit = Number(request.input('limit', 10))
      const offset = (page - 1) * limit

      const mahasiswa = await Database.rawQuery(
        `
        SELECT id, nim, nama, email, tanggal_lahir, jenis_kelamin,
               alamat, angkatan, ipk, status_aktif, created_at, updated_at
        FROM mahasiswa
        WHERE status_aktif = 1
        ORDER BY id DESC
        LIMIT ? OFFSET ?
        `,
        [limit, offset]
      )

      const totalResult = await Database.rawQuery(
        `SELECT COUNT(*) as total FROM mahasiswa WHERE status_aktif = 1`
      )

      const total = totalResult[0][0].total

      return response.ok({
        success: true,
        message: 'Data mahasiswa berhasil diambil',
        data: mahasiswa[0],
        meta: {
          total,
          page,
          limit,
          total_pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Gagal mengambil data mahasiswa',
        error: error.message,
      })
    }
  }

  /**
   * GET /mahasiswa/:id
   */
  async show({ params, response }: HttpContext) {
    try {
      const mahasiswa = await Database.rawQuery(
        `
        SELECT id, nim, nama, email, tanggal_lahir, jenis_kelamin,
               alamat, angkatan, ipk, status_aktif, created_at, updated_at
        FROM mahasiswa
        WHERE id = ?
        LIMIT 1
        `,
        [params.id]
      )

      if (mahasiswa[0].length === 0) {
        return response.notFound({
          success: false,
          message: 'Data mahasiswa tidak ditemukan',
        })
      }

      return response.ok({
        success: true,
        message: 'Data mahasiswa berhasil diambil',
        data: mahasiswa[0][0],
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Gagal mengambil data mahasiswa',
        error: error.message,
      })
    }
  }

  /**
   * POST /mahasiswa
   */
   async store({ request, response }: HttpContext) {
    try {
      const validator = vine.compile(
        vine.object({
          nim: vine.string().trim().maxLength(20),
          nama: vine.string().trim().maxLength(100),
          email: vine.string().email().maxLength(100).optional(),
          tanggal_lahir: vine.date().optional(),
          jenis_kelamin: vine.enum(['L', 'P']).optional(),
          alamat: vine.string().optional(),
          angkatan: vine.number().optional(),
          ipk: vine.number().range([0, 4]).optional(),
        })
      )

      const payload = await request.validateUsing(validator)

      const existing = await Database.rawQuery(
        `SELECT id FROM mahasiswa WHERE nim = ? LIMIT 1`,
        [payload.nim]
      )

      if (existing[0].length) {
        return response.unprocessableEntity({
          success: false,
          message: 'NIM sudah terdaftar',
        })
      }

      const result = await Database.rawQuery(
        `
        INSERT INTO mahasiswa
        (nim, nama, email, tanggal_lahir, jenis_kelamin,
         alamat, angkatan, ipk, status_aktif, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
        `,
        [
          payload.nim,
          payload.nama,
          payload.email,
          payload.tanggal_lahir,
          payload.jenis_kelamin,
          payload.alamat,
          payload.angkatan,
          payload.ipk,
        ]
      )

      const mahasiswa = await Database.rawQuery(
        `SELECT * FROM mahasiswa WHERE id = ? LIMIT 1`,
        [result[0].insertId]
      )

      return response.created({
        success: true,
        message: 'Data mahasiswa berhasil ditambahkan',
        data: mahasiswa[0][0],
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Gagal menambahkan data mahasiswa',
        error: error.message,
      })
    }
  }

  /**
   * PUT /mahasiswa/:id
   */
  async update({ request, params, response }: HttpContext) {
    try {
      const validator = vine.compile(
        vine.object({
          nim: vine.string().trim().maxLength(20),
          nama: vine.string().trim().maxLength(100),
          email: vine.string().email().maxLength(100).optional(),
          tanggal_lahir: vine.date().optional(),
          jenis_kelamin: vine.enum(['L', 'P']).optional(),
          alamat: vine.string().optional(),
          angkatan: vine.number().optional(),
          ipk: vine.number().range([0, 4]).optional(),
        })
      )

      const payload = await request.validateUsing(validator)

      const existing = await Database.rawQuery(
        `SELECT id FROM mahasiswa WHERE id = ? LIMIT 1`,
        [params.id]
      )

      if (!existing[0].length) {
        return response.notFound({
          success: false,
          message: 'Data mahasiswa tidak ditemukan',
        })
      }

      const duplicate = await Database.rawQuery(
        `SELECT id FROM mahasiswa WHERE nim = ? AND id != ? LIMIT 1`,
        [payload.nim, params.id]
      )

      if (duplicate[0].length) {
        return response.unprocessableEntity({
          success: false,
          message: 'NIM sudah terdaftar',
        })
      }

      await Database.rawQuery(
        `
        UPDATE mahasiswa SET
          nim = ?, nama = ?, email = ?, tanggal_lahir = ?, jenis_kelamin = ?,
          alamat = ?, angkatan = ?, ipk = ?, updated_at = NOW()
        WHERE id = ?
        `,
        [
          payload.nim,
          payload.nama,
          payload.email,
          payload.tanggal_lahir,
          payload.jenis_kelamin,
          payload.alamat,
          payload.angkatan,
          payload.ipk,
          params.id,
        ]
      )

      const mahasiswa = await Database.rawQuery(
        `SELECT * FROM mahasiswa WHERE id = ? LIMIT 1`,
        [params.id]
      )

      return response.ok({
        success: true,
        message: 'Data mahasiswa berhasil diupdate',
        data: mahasiswa[0][0],
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Gagal mengupdate data mahasiswa',
        error: error.message,
      })
    }
  }

  /**
   * DELETE /mahasiswa/:id
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const existing = await Database.rawQuery(
        `SELECT id FROM mahasiswa WHERE id = ? LIMIT 1`,
        [params.id]
      )

      if (existing[0].length === 0) {
        return response.notFound({
          success: false,
          message: 'Data mahasiswa tidak ditemukan',
        })
      }

      await Database.rawQuery(
        `DELETE FROM mahasiswa WHERE id = ?`,
        [params.id]
      )

      return response.ok({
        success: true,
        message: 'Data mahasiswa berhasil dihapus permanen',
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Gagal menghapus data mahasiswa',
        error: error.message,
      })
    }
  }
}
