// use cudarc::cublas::{result, safe, sys};
// use cudarc::cublaslt::{result, safe, sys};
// use cudarc::curand::{result, safe, sys};
// use cudarc::driver::{result, safe, sys};
// use cudarc::nccl::{result, safe, sys};
// use cudarc::nvrtc::{result, safe, sys};
//
// struct Memory {
//     current_state: usize,
//     action: u16,
//     reward: f32,
//     next_state: usize,
//     done: bool,
// }
//
// pub struct Qlearning {
//     gpu: cudarc::driver::CudaDevice,
//     actions: u32,
//     lr: f32,
//     gamma: f32,
//     exploration_proba: f16,
//     e_proba_decay: f16,
//     batchs: usize,
//
//     mem_buf: Vec<Memory, 2000>,
// }
//
// struct Scenario {
//     valid_reg: u8,
//     plus_2: u8,
//     reverse: u8,
//     skip: u8,
//     wild: u8,
//     plus_4: u8,
// }
//
// impl Qlearning {
//     pub fn new(size: u32) -> Qlearning {
//         return Qlearning {
//             gpu: cudarc::driver::CudaDevice::new(0),
//             actions: size,
//             lr: 0.001,
//             gamma: 0.99,
//             exploration_proba: 1.0,
//             e_proba_decay: 0.005,
//             batchs: 32,
//             mem_buf: Vec::new(),
//         };
//     }
// }
