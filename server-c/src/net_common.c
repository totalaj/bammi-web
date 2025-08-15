#include "net_common.h"
#include <arpa/inet.h>
#include <assert.h>
#include <stdio.h>
#include <string.h>

void net_buffer_reset(net_buf_t* buf) {
	buf->word_index	   = 0;
	buf->scratch	   = 0;
	buf->scratch_bits  = 0;
	buf->num_bits_read = 0;
}

void net_buffer_flush(net_buf_t* buf) {
	if(buf->scratch_bits == 0) {
		return;
	}
	buf->total_bits += buf->scratch_bits;
	buf->data[buf->word_index] = (buf->scratch & 0xFFFFFFFF);
	buf->scratch_bits		   = 0;
	buf->scratch >>= 32;
	buf->word_index++;
}

void net_buffer_print(net_buf_t* buf) {
	printf("buffer contains: ");
	for(int i = 0; i < NET_MAX_PACKET_SIZE; i++) {
		printf("%#08x,", buf->data[i]);
	}
	printf("\n");
}

void net_bits_write(net_buf_t* buf, int32_t size_bits, int32_t value) {
	assert(size_bits + buf->total_bits <=
		   NET_MAX_PACKET_SIZE * sizeof(uint32_t));
	//add value to scratch, shifted by how much is in the scratch right now
	buf->scratch |= value << buf->scratch_bits;
	//shift how much to shift next time
	buf->scratch_bits += size_bits;
	buf->total_bits += size_bits;
	//if scratch is full
	if(buf->scratch_bits >= 32) {
		//move from scratch to buffer
		buf->data[buf->word_index] = buf->scratch & 0xFFFFFFFF;
		buf->word_index++;		 //move buffer index
		buf->scratch >>= 32;	 //shift scratch if there is anything left in it
		buf->scratch_bits -= 32; //and move the index back
	}
}

uint32_t net_bits_read(net_buf_t* buf, int32_t size_bits) {

	if(buf->scratch_bits < size_bits) {
		buf->scratch |= (uint64_t)buf->data[buf->word_index]
						<< buf->scratch_bits;
		buf->scratch_bits += 32;
		buf->word_index++;
	}
	int32_t result =
		buf->scratch & (((uint64_t)1 << (uint64_t)size_bits) - (uint64_t)1);
	buf->scratch >>= size_bits;
	buf->scratch_bits -= size_bits;
	buf->num_bits_read += size_bits;

	return result;
}

void net_read_int(net_buf_t* buf, int32_t* value, const char* name) {
	(void)name;
	*value = net_bits_read(buf, 32);
}

void net_write_int(net_buf_t* buf, int32_t value, const char* name) {
	(void)name;
	net_bits_write(buf, 32, value);
}

void net_read_uint(net_buf_t* buf, uint32_t* value, const char* name) {
	(void)name;
	*value = net_bits_read(buf, 32);
}

void net_write_uint(net_buf_t* buf, uint32_t value, const char* name) {
	(void)name;
	net_bits_write(buf, 32, value);
}

void net_read_bool(net_buf_t* buf, bool* value, const char* name) {
	(void)name;
	*value = net_bits_read(buf, 1);
}

void net_write_bool(net_buf_t* buf, bool value, const char* name) {
	(void)name;
	net_bits_write(buf, 1, value);
}

void net_read_byte(net_buf_t* buf, int8_t* value, const char* name) {
	(void)name;
	*value = net_bits_read(buf, 8);
}

void net_write_byte(net_buf_t* buf, int8_t value, const char* name) {
	(void)name;
	net_bits_write(buf, 8, value);
}

void net_read_ubyte(net_buf_t* buf, uint8_t* value, const char* name) {
	(void)name;
	*value = net_bits_read(buf, 8);
}

void net_write_ubyte(net_buf_t* buf, uint8_t value, const char* name) {
	(void)name;
	net_bits_write(buf, 8, value);
}

void net_read_float(net_buf_t* buf, float* value, const char* name) {
	(void)name;
	*value = net_bits_read(buf, 32);
}

void net_write_float(net_buf_t* buf, float value, const char* name) {
	(void)name;
	net_bits_write(buf, 32, value);
}

void net_read_double(net_buf_t* buf, double* value, const char* name) {
	assert(false);
	(void)name;
	(void)buf;
	(void)value;
}

void net_write_double(net_buf_t* buf, double value, const char* name) {
	assert(false);
	(void)name;
	(void)buf;
	(void)value;
}
//
// void net_read_string(net_buf_t* buf, net_string_t* value, const char* name) {
// 	(void)name;
// 	assert(value->length <= MAX_NET_STRING_LENGTH);
// 	net_read_uint(buf, &value->length, "length");
// 	for(uint32_t i = 0; i < value->length; i++) {
// 		printf("current char: %c\n", value->str[i]);
// 		net_read_byte(buf, &value->str[i], "");
// 	}
// }
//
// void net_write_string(net_buf_t* buf, net_string_t* value, const char* name) {
// 	(void)name;
// 	assert(value->length <= MAX_NET_STRING_LENGTH);
// 	printf("length: %i", value->length);
// 	net_write_uint(buf, value->length, "length");
// 	for(uint32_t i = 0; i < value->length; i++) {
// 		printf("current char: %c\n", value->str[i]);
// 		net_write_byte(buf, value->str[i], "");
// 	}
// }
//
