<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'correo_institucional' => [
                'required',
                'email',
                'unique:users,correo_institucional',
                'regex:/^[a-zA-Z0-9._%+-]+@uas\.edu\.mx$/i'
            ],
            'password' => 'required|string|min:8',
            'carrera' => 'required|string|max:100',
        ];
    }
}
